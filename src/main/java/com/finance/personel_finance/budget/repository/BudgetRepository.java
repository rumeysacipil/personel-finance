package com.finance.personel_finance.budget.repository;

import com.finance.personel_finance.budget.model.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserIdAndYearAndMonth(Long userId, int year, int month);

    Optional<Budget> findByUserIdAndYearAndMonthAndCategory(Long userId, int year, int month, String category);
}