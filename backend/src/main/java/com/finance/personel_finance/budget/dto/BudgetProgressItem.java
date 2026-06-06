package com.finance.personel_finance.budget.dto;

import java.math.BigDecimal;

public record BudgetProgressItem(
        String category,
        BigDecimal monthlyLimit,
        BigDecimal spent,
        BigDecimal remaining,
        double percentUsed
) {}