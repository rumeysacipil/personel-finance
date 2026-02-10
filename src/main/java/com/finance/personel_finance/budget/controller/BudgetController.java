package com.finance.personel_finance.budget.controller;

import com.finance.personel_finance.budget.dto.*;
import com.finance.personel_finance.budget.service.BudgetService;
import com.finance.personel_finance.common.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService service;

    @GetMapping
    public List<BudgetResponse> list(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestParam int year,
            @RequestParam int month
    ) {
        if (me == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        return service.list(me.userId(), year, month);
    }

    @PostMapping
    public BudgetResponse upsert(
            @AuthenticationPrincipal UserPrincipal me,
            @Valid @RequestBody BudgetUpsertRequest req
    ) {
        if (me == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        return service.upsert(me.userId(), req);
    }

    @GetMapping("/progress")
    public BudgetProgressResponse progress(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestParam int year,
            @RequestParam int month
    ) {
        if (me == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        return service.progress(me.userId(), year, month);
    }
}
