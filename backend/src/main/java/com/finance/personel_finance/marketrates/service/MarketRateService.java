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

/**
 * Fetches live precious-metal and FX rates from external APIs
 * (GoldPriceZ for metals, Frankfurter for currency exchange).
 */
@Slf4j
@Service
public class MarketRateService {

    /** 1 troy ounce = 31.1034768 grams */
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

    /**
     * Fetches gold, silver, USD/TRY, and EUR/TRY rates.
     * The metals API is called only once to avoid duplicate network requests.
     */
    public MarketRateResponse fetchRates() {
        try {
            // Single API call for both gold and silver
            JsonNode metalsJson = fetchGoldPriceZJson();
            BigDecimal goldUsd = extractMetalOuncePrice(metalsJson, "gram_in_usd", "gold");
            BigDecimal silverUsd = extractMetalOuncePrice(metalsJson, "silver_gram_in_usd", "silver");

            BigDecimal usdTry = fetchFxRate("USD");
            BigDecimal eurTry = fetchFxRate("EUR");

            return new MarketRateResponse(goldUsd, silverUsd, usdTry, eurTry, Instant.now());
        } catch (Exception e) {
            log.error("Market rates fetch failed.", e);
            throw e;
        }
    }

    /**
     * Extracts a metal price from the GoldPriceZ JSON response
     * and converts from grams to troy ounces.
     */
    private BigDecimal extractMetalOuncePrice(JsonNode json, String field, String metalName) {
        JsonNode node = json.get(field);
        if (node == null) {
            throw new IllegalStateException(
                    "GoldPriceZ: '" + field + "' (" + metalName + ") not found. Response: " + truncate(json.toString()));
        }
        BigDecimal gramPrice = new BigDecimal(node.asText());
        return gramPrice.multiply(TROY_OUNCE_IN_GRAM).setScale(4, RoundingMode.HALF_UP);
    }

    /** Calls the GoldPriceZ API and returns the parsed JSON response. */
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

            // Some responses wrap JSON as an escaped string — unwrap if needed
            if (node.isTextual()) {
                node = objectMapper.readTree(node.asText());
            }

            if (!node.isObject()) {
                throw new IllegalStateException("GoldPriceZ: unexpected response type. Raw: " + truncate(raw));
            }

            return node;
        } catch (Exception e) {
            throw new IllegalStateException("GoldPriceZ response parse failed. Raw: " + truncate(raw), e);
        }
    }

    /** Fetches the TRY exchange rate for the given base currency from Frankfurter API. */
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