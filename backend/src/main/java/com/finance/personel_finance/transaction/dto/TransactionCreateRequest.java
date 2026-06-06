package com.finance.personel_finance.transaction.dto;

import com.finance.personel_finance.transaction.model.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionCreateRequest(//Bu “oluşturma” isteği: POST /transactions
        @NotNull TransactionType type,
        @NotBlank @Size(max = 50) String category,
        @Size(max = 255) String description,
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
        @NotBlank @Size(min = 3, max = 3) String currency,
        @NotNull LocalDate transactionDate
) {}
//Gerçek projelerde genelde userId body’den alınmaz; JWT/token’dan çıkarılır (güvenlik).
