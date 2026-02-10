package com.finance.personel_finance.marketrates.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finance.personel_finance.marketrates.config.MarketRateProperties;
import com.finance.personel_finance.marketrates.dto.MarketRateResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.restclient.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Slf4j
@Service
public class MarketRateService {

    // 1 troy ounce = 31.1034768 gram
    private static final BigDecimal TROY_OUNCE_IN_GRAM = new BigDecimal("31.1034768");

    private final RestTemplate restTemplate;
    private final MarketRateProperties props;
    private final ObjectMapper objectMapper;

    public MarketRateService(RestTemplateBuilder builder,
                             MarketRateProperties props,
                             ObjectMapper objectMapper) {
        this.props = props;
        this.objectMapper = objectMapper;

        this.restTemplate = builder
                .requestFactory(() -> {
                    SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
                    if (props.getTimeout() != null) {
                        int ms = (int) props.getTimeout().toMillis();
                        f.setConnectTimeout(ms);
                        f.setReadTimeout(ms);
                    }
                    return f;
                })
                .build();
    }

    public MarketRateResponse fetchRates() {
        try {
            // Gold + Silver USD/oz (biz gram alıp ounce’a çeviriyoruz)
            BigDecimal goldUsd = fetchGoldOunceUsdFromGoldPriceZ();
            BigDecimal silverUsd = fetchSilverOunceUsdFromGoldPriceZ();

            BigDecimal usdTry = fetchFxRate("USD");
            BigDecimal eurTry = fetchFxRate("EUR");

            return new MarketRateResponse(goldUsd, silverUsd, usdTry, eurTry, Instant.now());
        } catch (Exception e) {
            log.error("Market rates fetch failed.", e);
            throw e;
        }
    }

    private BigDecimal fetchGoldOunceUsdFromGoldPriceZ() {
        JsonNode json = fetchGoldPriceZJson();

        // Dokümandaki örnek alan: gram_in_usd (gold)
        JsonNode gramInUsd = json.get("gram_in_usd");
        if (gramInUsd == null) {
            throw new IllegalStateException("GoldPriceZ: 'gram_in_usd' not found. Response: " + truncate(json.toString()));
        }

        BigDecimal gram = new BigDecimal(gramInUsd.asText());
        return gram.multiply(TROY_OUNCE_IN_GRAM).setScale(4, RoundingMode.HALF_UP);
    }

    private BigDecimal fetchSilverOunceUsdFromGoldPriceZ() {
        JsonNode json = fetchGoldPriceZJson();

        // Dokümandaki örnek alan: silver_gram_in_usd
        JsonNode silverGramInUsd = json.get("silver_gram_in_usd");
        if (silverGramInUsd == null) {
            throw new IllegalStateException("GoldPriceZ: 'silver_gram_in_usd' not found. Response: " + truncate(json.toString()));
        }

        BigDecimal gram = new BigDecimal(silverGramInUsd.asText());
        return gram.multiply(TROY_OUNCE_IN_GRAM).setScale(4, RoundingMode.HALF_UP);
    }

    private JsonNode fetchGoldPriceZJson() {
        String url = props.getGoldpricez().getBaseUrl() + props.getGoldpricez().getPath();

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-API-KEY", props.getGoldpricez().getApiKey());
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        String raw;
        try {
            ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            raw = resp.getBody();
        } catch (RestClientException e) {
            throw new IllegalStateException("GoldPriceZ API call failed: " + e.getMessage(), e);
        }

        if (raw == null || raw.isBlank()) {
            throw new IllegalStateException("GoldPriceZ API returned empty response.");
        }

        try {
            JsonNode node = objectMapper.readTree(raw);

            // ✅ Bazı cevaplar JSON'u string olarak döndürüyor:  "\"{...}\""
            if (node.isTextual()) {
                String innerJson = node.asText();
                node = objectMapper.readTree(innerJson);
            }

            if (!node.isObject()) {
                throw new IllegalStateException("GoldPriceZ: unexpected response type. Raw: " + truncate(raw));
            }

            return node;
        } catch (Exception e) {
            throw new IllegalStateException("GoldPriceZ response parse failed. Raw: " + truncate(raw), e);
        }
    }

    private BigDecimal fetchFxRate(String baseCurrency) {
        String url = String.format(props.getFxUrlTemplate(), baseCurrency);

        String raw;
        try {
            raw = restTemplate.getForObject(url, String.class);
        } catch (RestClientException e) {
            throw new IllegalStateException("FX API call failed: " + e.getMessage(), e);
        }

        if (raw == null || raw.isBlank()) {
            throw new IllegalStateException("FX API returned empty response.");
        }

        try {
            JsonNode node = objectMapper.readTree(raw);

            JsonNode rates = node.get("rates");
            if (rates == null || !rates.isObject()) {
                throw new IllegalStateException("FX API missing 'rates'. Raw: " + truncate(raw));
            }

            JsonNode tryNode = rates.get("TRY");
            if (tryNode == null) {
                throw new IllegalStateException("FX API missing TRY rate. Raw: " + truncate(raw));
            }

            return new BigDecimal(tryNode.asText());
        } catch (Exception e) {
            throw new IllegalStateException("FX API parse failed. Raw: " + truncate(raw), e);
        }
    }


    private String truncate(String s) {
        if (s == null) return null;
        return s.length() <= 400 ? s : s.substring(0, 400) + "...";
    }
}