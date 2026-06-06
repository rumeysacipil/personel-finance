package com.finance.personel_finance.budget.controller;

import com.finance.personel_finance.budget.dto.*;
import com.finance.personel_finance.budget.service.BudgetService;
import com.finance.personel_finance.common.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing monthly budget limits per category.
 * All endpoints require authentication.
 */
@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService service;

    /** Lists all budgets for the given month. */
    @GetMapping
    public List<BudgetResponse> list(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return service.list(me.userId(), year, month);
    }

    /** Creates or updates a budget for the given category and month. */
    @PostMapping
    public BudgetResponse upsert(
            @AuthenticationPrincipal UserPrincipal me,
            @Valid @RequestBody BudgetUpsertRequest req
    ) {
        return service.upsert(me.userId(), req);
    }

    /** Returns budget progress (spent vs limit) for all categories in the given month. */
    @GetMapping("/progress")
    public BudgetProgressResponse progress(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return service.progress(me.userId(), year, month);
    }

    /** Deletes a budget by its ID (ownership is verified in the service layer). */
    @DeleteMapping("/{id}")
    public void delete(
            @AuthenticationPrincipal UserPrincipal me,
            @PathVariable Long id
    ) {
        service.delete(me.userId(), id);
    }
}
