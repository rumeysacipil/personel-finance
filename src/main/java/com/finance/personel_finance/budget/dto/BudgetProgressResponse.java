package com.finance.personel_finance.budget.dto;

import java.util.List;

public record BudgetProgressResponse(
        int year,
        int month,
        List<BudgetProgressItem> items
) {}