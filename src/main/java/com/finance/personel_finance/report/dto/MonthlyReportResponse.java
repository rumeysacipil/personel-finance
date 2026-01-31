package com.finance.personel_finance.report.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Aylık finans raporunu temsil eder.
 * Frontend bu response'u dashboard veya rapor ekranında kullanır.
 */
public record MonthlyReportResponse(

        // Raporun ait olduğu kullanıcı
        Long userId,

        // Rapor yılı (örn: 2026)
        int year,

        // Rapor ayı (1-12)
        int month,

        // Seçilen ay içindeki toplam gelir
        BigDecimal totalIncome,

        // Seçilen ay içindeki toplam gider
        BigDecimal totalExpense,

        // Net kazanç = income - expense
        BigDecimal netAmount,

        // Giderlerin kategori bazlı dağılımı
        List<CategoryTotalResponse> expenseByCategory
) {}
