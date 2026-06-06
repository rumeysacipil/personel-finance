package com.finance.personel_finance.marketrates.controller;

import com.finance.personel_finance.marketrates.dto.MarketRateResponse;
import com.finance.personel_finance.marketrates.service.MarketRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Exposes live market rates (gold, silver, USD/TRY, EUR/TRY).
 * CORS is configured globally in SecurityConfig.
 */
@RestController
@RequestMapping("/api/market-rates")
@RequiredArgsConstructor
public class MarketRateController {

    private final MarketRateService marketRateService;

    /** Returns the latest market rates from external data providers. */
    @GetMapping
    public MarketRateResponse getMarketRates() {
        return marketRateService.fetchRates();
    }
}