package com.finance.personel_finance.marketrates.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record MarketRateResponse(
        BigDecimal goldUsd,
        BigDecimal silverUsd,
        BigDecimal usdTry,
        BigDecimal eurTry,
        Instant lastUpdated
) { }
