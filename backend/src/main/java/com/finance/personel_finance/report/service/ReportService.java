package com.finance.personel_finance.report.service;

import com.finance.personel_finance.report.dto.CategoryTotalResponse;
import com.finance.personel_finance.report.dto.DailyTrendPoint;
import com.finance.personel_finance.report.dto.MonthlyReportResponse;
import com.finance.personel_finance.report.dto.MonthlyTrendsResponse;
import com.finance.personel_finance.transaction.model.enums.TransactionType;
import com.finance.personel_finance.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        if (income == null) income = BigDecimal.ZERO;

        BigDecimal expense = repo.sumAmountByType(userId, TransactionType.EXPENSE, from, to);
        if (expense == null) expense = BigDecimal.ZERO;

        BigDecimal net = income.subtract(expense);

        List<CategoryTotalResponse> expenseByCategory =
                repo.totalsByCategory(userId, TransactionType.EXPENSE, from, to)
                        .stream()
                        .map(row -> new CategoryTotalResponse(
                                String.valueOf(row[0]),
                                row[1] == null ? BigDecimal.ZERO : (BigDecimal) row[1]
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

    public MonthlyTrendsResponse trends(Long userId, int year, int month) {
        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to = from.withDayOfMonth(from.lengthOfMonth());

        // day -> [income, expense]
        Map<Integer, BigDecimal> incomeByDay = new HashMap<>();
        Map<Integer, BigDecimal> expenseByDay = new HashMap<>();

        List<Object[]> rows = repo.dailyTotalsByType(userId, from, to);

        for (Object[] r : rows) {
            LocalDate date = (LocalDate) r[0];
            TransactionType type = (TransactionType) r[1];
            BigDecimal sum = (BigDecimal) r[2];

            int day = date.getDayOfMonth();
            if (type == TransactionType.INCOME) {
                incomeByDay.put(day, sum);
            } else if (type == TransactionType.EXPENSE) {
                expenseByDay.put(day, sum);
            }
        }

        List<DailyTrendPoint> points = new ArrayList<>();
        int daysInMonth = from.lengthOfMonth();

        for (int d = 1; d <= daysInMonth; d++) {
            BigDecimal income = incomeByDay.getOrDefault(d, BigDecimal.ZERO);
            BigDecimal expense = expenseByDay.getOrDefault(d, BigDecimal.ZERO);
            points.add(new DailyTrendPoint(d, income, expense));
        }

        return new MonthlyTrendsResponse(year, month, points);
    }
}
