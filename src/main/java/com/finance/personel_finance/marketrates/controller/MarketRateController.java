package com.finance.personel_finance.marketrates.controller;

import com.finance.personel_finance.marketrates.dto.MarketRateResponse;
import com.finance.personel_finance.marketrates.service.MarketRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/market-rates")
@RequiredArgsConstructor
public class MarketRateController {
    private final MarketRateService marketRateService;

    @GetMapping
    public MarketRateResponse getMarketRates() {
        return marketRateService.fetchRates();
    }
}