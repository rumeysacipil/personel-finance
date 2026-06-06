package com.finance.personel_finance.report.service;


import com.finance.personel_finance.report.dto.MonthlyReportResponse;
import com.finance.personel_finance.transaction.model.entity.Transaction;
import com.finance.personel_finance.transaction.model.enums.TransactionType;
import com.finance.personel_finance.transaction.repository.TransactionRepository;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ReportPdfService {

    private final TransactionRepository transactionRepository;

    private static final Locale TR = Locale.forLanguageTag("tr-TR");
    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd.MM.yyyy");

    public byte[] generateMonthlyPdf(
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

        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // ---- Fonts
            Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD);
            Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD);
            Font textFont = new Font(Font.HELVETICA, 10);
            Font incomeFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.GREEN);
            Font expenseFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.RED);

            // ---- Title
            String monthName = ym.getMonth().getDisplayName(TextStyle.FULL, TR);
            Paragraph title = new Paragraph(
                    capitalize(monthName) + " " + year + " Raporu",
                    titleFont
            );
            title.setAlignment(Element.ALIGN_LEFT);
            document.add(title);

            Paragraph info = new Paragraph(
                    "Oluşturulma: " + LocalDate.now().format(DATE_FMT),
                    new Font(Font.HELVETICA, 9, Font.ITALIC)
            );
            info.setAlignment(Element.ALIGN_RIGHT);
            document.add(info);

            document.add(Chunk.NEWLINE);

            // ---- Table (4 columns)
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2, 2, 4, 2});

            addHeader(table, "Tarih", headerFont);
            addHeader(table, "Kategori", headerFont);
            addHeader(table, "Açıklama", headerFont);
            addHeader(table, "Tutar", headerFont);

            for (Transaction tx : transactions) {
                table.addCell(new PdfPCell(new Phrase(
                        tx.getTransactionDate().format(DATE_FMT), textFont)));

                table.addCell(new PdfPCell(new Phrase(
                        tx.getCategory(), textFont)));

                table.addCell(new PdfPCell(new Phrase(
                        tx.getDescription(), textFont)));

                Font amountFont =
                        tx.getType() == TransactionType.INCOME
                                ? incomeFont
                                : expenseFont;

                String sign = tx.getType() == TransactionType.INCOME ? "+" : "-";

                PdfPCell amountCell = new PdfPCell(new Phrase(
                        sign + tx.getAmount(), amountFont));
                amountCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

                table.addCell(amountCell);
            }

            document.add(table);
            document.add(Chunk.NEWLINE);

            // ---- Summary
            // ---- Summary (3 columns, NO empty cells)
            PdfPTable summaryTable = new PdfPTable(3);
            summaryTable.setWidthPercentage(100);
            summaryTable.setSpacingBefore(10);
            summaryTable.setWidths(new float[]{3, 3, 3});

// Header row
            addSummaryHeader(summaryTable, "Total Income");
            addSummaryHeader(summaryTable, "Total Expense");
            addSummaryHeader(summaryTable, "Net Amount");

// Values row
            addSummaryValue(
                    summaryTable,
                    "+" + summary.totalIncome(),
                    incomeFont,
                    Element.ALIGN_RIGHT
            );

            addSummaryValue(
                    summaryTable,
                    "-" + summary.totalExpense(),
                    expenseFont,
                    Element.ALIGN_RIGHT
            );

            Font netFont = summary.netAmount().doubleValue() >= 0
                    ? incomeFont
                    : expenseFont;

            addSummaryValue(
                    summaryTable,
                    summary.netAmount().toString(),
                    netFont,
                    Element.ALIGN_RIGHT
            );

            document.add(summaryTable);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed", e);
        }
    }

    private void addHeader(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(Color.LIGHT_GRAY);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private void addSummaryHeader(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text,
                new Font(Font.HELVETICA, 10, Font.BOLD)));
        cell.setBackgroundColor(Color.LIGHT_GRAY);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(6);
        table.addCell(cell);
    }

    private void addSummaryValue(
            PdfPTable table,
            String value,
            Font font,
            int alignment
    ) {
        PdfPCell cell = new PdfPCell(new Phrase(value, font));
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(8);
        table.addCell(cell);
    }


    private String capitalize(String s) {
        return s.substring(0, 1).toUpperCase(TR) + s.substring(1);
    }
}

