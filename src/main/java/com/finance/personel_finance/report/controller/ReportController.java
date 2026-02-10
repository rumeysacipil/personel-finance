package com.finance.personel_finance.report.controller;


import com.finance.personel_finance.common.security.UserPrincipal;
import com.finance.personel_finance.report.dto.MonthlyReportResponse;
import com.finance.personel_finance.report.dto.MonthlyTrendsResponse;
import com.finance.personel_finance.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    // Ne işe yarar? Rapor iş mantığı service’te, controller sadece yönlendirir.
    private final ReportService service;

    /**
     * Ne işe yarar?
     * - Login olan kullanıcının aylık özet raporunu döndürür.
     * - userId parametre olarak alınmaz, JWT token’dan gelir.
     * <p>
     * Örnek:
     * GET /api/reports/monthly?year=2026&month=1
     */
    @GetMapping("/monthly")
    public MonthlyReportResponse monthly(
            @AuthenticationPrincipal UserPrincipal me, // ✅ JWT'den kullanıcı
            @RequestParam int year,
            @RequestParam int month
    )
    {
        if (me == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        System.out.println("ME => "+me);
        System.out.println("USER_ID => "+(me !=null?me.userId():null));
        return service.monthly(me.userId(), year, month);
    }

    /**
     * Ne işe yarar?
     * - Login olan kullanıcının aylık Excel raporunu indirir.
     * - userId JWT token’dan alınır.
     */
    @GetMapping("/monthly/excel")
    public ResponseEntity<byte[]> downloadMonthlyExcel(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestParam int year,
            @RequestParam int month
    ) {
        Long userId = me.userId();
        byte[] excel = service.monthlyExcel(userId, year, month);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=monthly-report-" + year + "-" + month + ".xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }

    /**
     * Ne işe yarar?
     * - Login olan kullanıcının aylık PDF raporunu indirir.
     * - userId JWT token’dan alınır.
     */
    @GetMapping("/monthly/pdf")
    public ResponseEntity<byte[]> downloadMonthlyPdf(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestParam int year,
            @RequestParam int month
    ) {
        Long userId = me.userId();
        byte[] pdf = service.monthlyPdf(userId, year, month);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=monthly-report-" + year + "-" + month + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/trends")
    public MonthlyTrendsResponse trends(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestParam int year,
            @RequestParam int month
    ) {
        if (me == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return service.trends(me.userId(), year, month);
    }
}


