package com.finance.personel_finance.budget.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record BudgetUpsertRequest(
        @NotBlank String category,
        @NotNull @DecimalMin(value = "0.01") BigDecimal monthlyLimit,
        @Min(2000) int year,
        @Min(1) @Max(12) int month
) {}