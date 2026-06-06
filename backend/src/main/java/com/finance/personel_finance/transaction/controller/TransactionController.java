package com.finance.personel_finance.transaction.controller;

import com.finance.personel_finance.common.security.UserPrincipal;
import com.finance.personel_finance.transaction.dto.PagedResponse;
import com.finance.personel_finance.transaction.dto.TransactionCreateRequest;
import com.finance.personel_finance.transaction.dto.TransactionResponse;
import com.finance.personel_finance.transaction.dto.TransactionUpdateRequest;
import com.finance.personel_finance.transaction.model.enums.TransactionType;
import com.finance.personel_finance.transaction.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * REST controller for managing financial transactions (income/expense).
 * All endpoints require authentication — userId is extracted from the JWT token.
 */
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService service;

    /** Creates a new income or expense transaction. */
    @PostMapping
    public TransactionResponse create(
            @AuthenticationPrincipal UserPrincipal me,
            @Valid @RequestBody TransactionCreateRequest req
    ) {
        return service.create(me.userId(), req);
    }

    /** Lists the user's transactions with optional date-range, type, and category filters. */
    @GetMapping
    public PagedResponse<TransactionResponse> list(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<TransactionResponse> result =
                service.list(me.userId(), from, to, type, category, page, size);

        return new PagedResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    /** Updates an existing transaction (ownership is verified in the service layer). */
    @PutMapping("/{id}")
    public TransactionResponse update(
            @AuthenticationPrincipal UserPrincipal me,
            @PathVariable Long id,
            @Valid @RequestBody TransactionUpdateRequest req
    ) {
        return service.update(me.userId(), id, req);
    }

    /** Deletes a transaction (ownership is verified in the service layer). */
    @DeleteMapping("/{id}")
    public void delete(
            @AuthenticationPrincipal UserPrincipal me,
            @PathVariable Long id
    ) {
        service.delete(me.userId(), id);
    }
}
