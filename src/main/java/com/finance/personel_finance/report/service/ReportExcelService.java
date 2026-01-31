package com.finance.personel_finance.report.service;


import com.finance.personel_finance.report.dto.CategoryTotalResponse;
import com.finance.personel_finance.report.dto.MonthlyReportResponse;
import com.finance.personel_finance.transaction.model.entity.Transaction;
import com.finance.personel_finance.transaction.model.enums.TransactionType;
import com.finance.personel_finance.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ReportExcelService {
    /**
     * Aylık raporu Excel (.xlsx) dosyasına çevirir.
     */

    private final TransactionRepository transactionRepository;

    private static final Locale TR = Locale.forLanguageTag("tr-TR");
    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd.MM.yyyy");

    /**
     * Aylık Excel raporu üretir
     */
    public byte[] generateMonthlyExcel(
            Long userId,
            int year,
            int month,
            MonthlyReportResponse summary
    ) {

        YearMonth ym = YearMonth.of(year, month);
        LocalDate from = ym.atDay(1);
        LocalDate to = ym.atEndOfMonth();

        List<Transaction> transactions =
                transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                        userId, from, to
                );

        Workbook wb = new XSSFWorkbook();
        Sheet sh = wb.createSheet("Rapor");

        // =========================
        // STYLES
        // =========================
        DataFormat df = wb.createDataFormat();

        CellStyle titleStyle = wb.createCellStyle();
        Font titleFont = wb.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);

        CellStyle infoStyle = wb.createCellStyle();
        Font infoFont = wb.createFont();
        infoFont.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
        infoStyle.setFont(infoFont);
        infoStyle.setAlignment(HorizontalAlignment.RIGHT);

        CellStyle headerStyle = wb.createCellStyle();
        Font headerFont = wb.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        border(headerStyle);

        CellStyle textStyle = wb.createCellStyle();
        border(textStyle);

        CellStyle incomeStyle = wb.createCellStyle();
        incomeStyle.setDataFormat(df.getFormat("+#,##0.00"));
        Font incFont = wb.createFont();
        incFont.setColor(IndexedColors.GREEN.getIndex());
        incFont.setBold(true);
        incomeStyle.setFont(incFont);
        border(incomeStyle);

        CellStyle expenseStyle = wb.createCellStyle();
        expenseStyle.setDataFormat(df.getFormat("-#,##0.00"));
        Font expFont = wb.createFont();
        expFont.setColor(IndexedColors.RED.getIndex());
        expFont.setBold(true);
        expenseStyle.setFont(expFont);
        border(expenseStyle);

        CellStyle boxTitle = wb.createCellStyle();
        Font boxFont = wb.createFont();
        boxFont.setBold(true);
        boxTitle.setFont(boxFont);
        boxTitle.setAlignment(HorizontalAlignment.CENTER);
        boxTitle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        boxTitle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        border(boxTitle);

        // =========================
        // CONTENT
        // =========================
        int r = 0;

        String monthName =
                ym.getMonth().getDisplayName(TextStyle.FULL, TR);
        String title =
                capitalize(monthName) + " " + year + " Raporu";

        // ---- Title Row (A–D)
        Row titleRow = sh.createRow(r++);
        Cell tCell = titleRow.createCell(0);
        tCell.setCellValue(title);
        tCell.setCellStyle(titleStyle);
        sh.addMergedRegion(new CellRangeAddress(0, 0, 0, 2));

        Cell info = titleRow.createCell(3);
        info.setCellValue("İndirme: " + LocalDate.now().format(DATE_FMT));
        info.setCellStyle(infoStyle);

        r++; // boşluk

        // ---- Table Header
        Row header = sh.createRow(r++);
        headerCell(header, 0, "İşlem Tarihi", headerStyle);
        headerCell(header, 1, "Kategori", headerStyle);
        headerCell(header, 2, "Açıklama", headerStyle);
        headerCell(header, 3, "Tutar", headerStyle);

        // ---- Table Rows
        for (Transaction tx : transactions) {
            Row row = sh.createRow(r++);

            cell(row, 0, tx.getTransactionDate().format(DATE_FMT), textStyle);
            cell(row, 1, tx.getCategory(), textStyle);
            cell(row, 2, tx.getDescription(), textStyle);

            Cell amount = row.createCell(3);
            amount.setCellValue(tx.getAmount().doubleValue());
            amount.setCellStyle(
                    tx.getType() == TransactionType.INCOME
                            ? incomeStyle
                            : expenseStyle
            );
        }

        r++; // boşluk

        // ---- Bottom Summary (A–D SAME WIDTH)
        Row boxTitleRow = sh.createRow(r++);
        Row boxValueRow = sh.createRow(r++);

        // Income -> A
        box(sh, boxTitleRow, boxValueRow, 0,
                "Total Income",
                summary.totalIncome().doubleValue(),
                incomeStyle,
                boxTitle);

        // Expense -> B
        box(sh, boxTitleRow, boxValueRow, 1,
                "Total Expense",
                summary.totalExpense().doubleValue(),
                expenseStyle,
                boxTitle);

        // Net -> C–D
        CellStyle netStyle =
                summary.netAmount().doubleValue() >= 0
                        ? incomeStyle
                        : expenseStyle;

        mergeBox(sh, boxTitleRow, boxValueRow, 2, 3,
                "Net Amount",
                summary.netAmount().doubleValue(),
                netStyle,
                boxTitle);

        // ---- Column Widths (A–D)
        sh.setColumnWidth(0, 18 * 256);
        sh.setColumnWidth(1, 18 * 256);
        sh.setColumnWidth(2, 32 * 256);
        sh.setColumnWidth(3, 18 * 256);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            wb.write(out);
            wb.close();
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    // =========================
    // HELPERS
    // =========================

    private void headerCell(Row r, int c, String v, CellStyle s) {
        Cell cell = r.createCell(c);
        cell.setCellValue(v);
        cell.setCellStyle(s);
    }

    private void cell(Row r, int c, String v, CellStyle s) {
        Cell cell = r.createCell(c);
        cell.setCellValue(v);
        cell.setCellStyle(s);
    }

    private void box(
            Sheet sh, Row tRow, Row vRow, int col,
            String title, double value,
            CellStyle valueStyle, CellStyle titleStyle
    ) {
        Cell t = tRow.createCell(col);
        t.setCellValue(title);
        t.setCellStyle(titleStyle);

        Cell v = vRow.createCell(col);
        v.setCellValue(value);
        v.setCellStyle(valueStyle);
    }

    private void mergeBox(
            Sheet sh, Row tRow, Row vRow,
            int from, int to,
            String title, double value,
            CellStyle valueStyle, CellStyle titleStyle
    ) {
        Cell t = tRow.createCell(from);
        t.setCellValue(title);
        t.setCellStyle(titleStyle);
        sh.addMergedRegion(new CellRangeAddress(
                tRow.getRowNum(), tRow.getRowNum(), from, to));

        Cell v = vRow.createCell(from);
        v.setCellValue(value);
        v.setCellStyle(valueStyle);
        sh.addMergedRegion(new CellRangeAddress(
                vRow.getRowNum(), vRow.getRowNum(), from, to));
    }

    private void border(CellStyle s) {
        s.setBorderBottom(BorderStyle.THIN);
        s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN);
        s.setBorderRight(BorderStyle.THIN);
    }

    private String capitalize(String s) {
        return s.substring(0, 1).toUpperCase(TR) + s.substring(1);
    }
}