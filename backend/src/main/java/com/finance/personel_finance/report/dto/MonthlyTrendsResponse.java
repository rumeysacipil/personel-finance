package com.finance.personel_finance.report.dto;

import java.util.List;

public record MonthlyTrendsResponse(
        int year,
        int month,
        List<DailyTrendPoint> days
) {}