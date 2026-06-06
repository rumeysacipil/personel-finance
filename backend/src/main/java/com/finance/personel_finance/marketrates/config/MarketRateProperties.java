package com.finance.personel_finance.marketrates.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import java.time.Duration;

@Data
@ConfigurationProperties(prefix = "app.market-rates")
public class MarketRateProperties {

    private String fxUrlTemplate;
    private Duration timeout;

    private GoldPricez goldpricez = new GoldPricez();

    public static class GoldPricez {
        private String baseUrl;
        private String apiKey;
        private String path;

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public String getPath() {
            return path;
        }

        public void setPath(String path) {
            this.path = path;
        }
    }

    public String getFxUrlTemplate() {
        return fxUrlTemplate;
    }

    public void setFxUrlTemplate(String fxUrlTemplate) {
        this.fxUrlTemplate = fxUrlTemplate;
    }

    public Duration getTimeout() {
        return timeout;
    }

    public void setTimeout(Duration timeout) {
        this.timeout = timeout;
    }

    public GoldPricez getGoldpricez() {
        return goldpricez;
    }

    public void setGoldpricez(GoldPricez goldpricez) {
        this.goldpricez = goldpricez;
    }
}
