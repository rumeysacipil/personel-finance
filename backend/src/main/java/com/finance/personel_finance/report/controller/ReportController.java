package com.finance.personel_finance.report.controller;

import com.finance.personel_finance.common.security.UserPrincipal;
import com.finance.personel_finance.report.dto.MonthlyReportResponse;
import com.finance.personel_finance.report.dto.MonthlyTrendsResponse;
import com.finance.personel_finance.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Exposes monthly financial reports, spending trends,
 * and downloadable Excel / PDF exports.
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService service;

    /** Returns the monthly income/expense/net summary with category breakdown. */
    @GetMapping("/monthly")
    public MonthlyReportResponse monthly(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return service.monthly(me.userId(), year, month);
    }

    /** Downloads the monthly report as an Excel (.xlsx) file. */
    @GetMapping("/monthly/excel")
    public ResponseEntity<byte[]> downloadMonthlyExcel(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestParam int year,
            @RequestParam int month
    ) {
        byte[] excel = service.monthlyExcel(me.userId(), year, month);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=monthly-report-" + year + "-" + month + ".xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }

    /** Downloads the monthly report as a PDF file. */
    @GetMapping("/monthly/pdf")
    public ResponseEntity<byte[]> downloadMonthlyPdf(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestParam int year,
            @RequestParam int month
    ) {
        byte[] pdf = service.monthlyPdf(me.userId(), year, month);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=monthly-report-" + year + "-" + month + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    /** Returns daily income/expense trend data for the selected month. */
    @GetMapping("/trends")
    public MonthlyTrendsResponse trends(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return service.trends(me.userId(), year, month);
    }
}
