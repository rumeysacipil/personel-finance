package com.finance.personel_finance.report.dto;

import java.math.BigDecimal;

public record DailyTrendPoint(
        int day,
        BigDecimal income,
        BigDecimal expense
) {}