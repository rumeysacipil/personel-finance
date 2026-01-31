package com.finance.personel_finance.report.service;

import com.finance.personel_finance.report.dto.CategoryTotalResponse;
import com.finance.personel_finance.report.dto.MonthlyReportResponse;
import com.finance.personel_finance.transaction.model.enums.TransactionType;
import com.finance.personel_finance.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    // Ne işe yarar? Report verilerini transaction tablosundan çeker
    private final TransactionRepository repo;

    // Ne işe yarar? Excel çıktısı üretir
    private final ReportExcelService excelService;

    // Ne işe yarar? PDF çıktısı üretir
    private final ReportPdfService pdfService;

    /**
     * Ne işe yarar?
     * - Kullanıcının seçilen ay için gelir/gider/net özetini hesaplar
     * - Kategori bazlı gider toplamlarını çıkarır
     */

    @Cacheable(
            value = "monthlyReports",
            key = "#userId + ':' + #year + ':' + #month"
    )
    public MonthlyReportResponse monthly(Long userId, int year, int month) {

        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate from = yearMonth.atDay(1);
        LocalDate to = yearMonth.atEndOfMonth();

        BigDecimal income = repo.sumAmountByType(userId, TransactionType.INCOME, from, to);
        BigDecimal expense = repo.sumAmountByType(userId, TransactionType.EXPENSE, from, to);
        BigDecimal net = income.subtract(expense);

        // Ne işe yarar? (category -> total) listesi döner
        List<CategoryTotalResponse> expenseByCategory =
                repo.totalsByCategory(userId, TransactionType.EXPENSE, from, to)
                        .stream()
                        .map(row -> new CategoryTotalResponse(
                                (String) row[0],
                                (BigDecimal) row[1]
                        ))
                        .toList();

        return new MonthlyReportResponse(
                userId,
                year,
                month,
                income,
                expense,
                net,
                expenseByCategory
        );
    }

    /**
     * Ne işe yarar? Monthly summary’den Excel üretir.
     */
    public byte[] monthlyExcel(Long userId, int year, int month) {
        MonthlyReportResponse summary = monthly(userId, year, month);
        return excelService.generateMonthlyExcel(userId, year, month, summary);
    }

    /**
     * Ne işe yarar? Monthly summary’den PDF üretir.
     */
    public byte[] monthlyPdf(Long userId, int year, int month) {
        MonthlyReportResponse summary = monthly(userId, year, month);
        return pdfService.generateMonthlyPdf(userId, year, month, summary);
    }
}
