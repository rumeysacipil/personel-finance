package com.finance.personel_finance.budget.service;

import com.finance.personel_finance.budget.dto.*;
import com.finance.personel_finance.budget.model.entity.Budget;
import com.finance.personel_finance.budget.repository.BudgetRepository;
import com.finance.personel_finance.transaction.model.enums.TransactionType;
import com.finance.personel_finance.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    public List<BudgetResponse> list(Long userId, int year, int month) {
        return budgetRepository.findByUserIdAndYearAndMonth(userId, year, month).stream()
                .map(b -> new BudgetResponse(b.getId(), b.getCategory(), b.getMonthlyLimit()))
                .toList();
    }

    public BudgetResponse upsert(Long userId, BudgetUpsertRequest req) {
        String cat = req.category().trim(); // orijinal haliyle sakla

        Budget b = budgetRepository
                .findByUserIdAndYearAndMonthAndCategory(userId, req.year(), req.month(), cat)
                .orElseGet(() -> Budget.builder()
                        .userId(userId)
                        .year(req.year())
                        .month(req.month())
                        .category(cat)
                        .build());

        b.setMonthlyLimit(req.monthlyLimit());
        Budget saved = budgetRepository.save(b);

        return new BudgetResponse(saved.getId(), saved.getCategory(), saved.getMonthlyLimit());
    }

    public BudgetProgressResponse progress(Long userId, int year, int month) {
        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to = from.withDayOfMonth(from.lengthOfMonth());

        // seçilen ayda expense totals
        List<Object[]> rows = transactionRepository.spentByCategory(userId, TransactionType.EXPENSE, from, to);

        Map<String, BigDecimal> spentMap = new HashMap<>();
        for (Object[] r : rows) {
            String key = String.valueOf(r[0]).trim().toLowerCase(Locale.ROOT); // TR i bug fix
            BigDecimal spent = (BigDecimal) r[1];
            spentMap.put(key, spent);
        }

        List<BudgetProgressItem> items = new ArrayList<>();

        // ✅ sadece seçilen ayın budget'ları
        List<Budget> budgets = budgetRepository.findByUserIdAndYearAndMonth(userId, year, month);

        for (Budget b : budgets) {
            BigDecimal limit = b.getMonthlyLimit() == null ? BigDecimal.ZERO : b.getMonthlyLimit();

            String key = b.getCategory() == null ? "" : b.getCategory().trim().toLowerCase(Locale.ROOT);
            BigDecimal spent = spentMap.getOrDefault(key, BigDecimal.ZERO);

            BigDecimal remaining = limit.subtract(spent);

            double percentUsed = 0d;
            if (limit.signum() > 0) {
                percentUsed = spent.divide(limit, 6, RoundingMode.HALF_UP).doubleValue() * 100.0;
            }

            items.add(new BudgetProgressItem(
                    b.getCategory(),
                    limit,
                    spent,
                    remaining,
                    percentUsed
            ));
        }

        items.sort((a, b) -> Double.compare(b.percentUsed(), a.percentUsed()));
        return new BudgetProgressResponse(year, month, items);
    }
}
