package com.finance.personel_finance.report.dto;

import java.math.BigDecimal;

public record CategoryTotalResponse(
        // Harcama kategorisi (RENT, GROCERIES vs.)
        String category,
        // Bu kategori için toplam harcama tutarı
        BigDecimal total
) {}
