package com.finance.personel_finance.budget.dto;

import java.math.BigDecimal;

public record BudgetResponse(
        Long id,
        String category,
        BigDecimal monthlyLimit
) {}