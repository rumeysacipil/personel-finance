package com.finance.personel_finance.transaction.dto;

import com.finance.personel_finance.transaction.model.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
//
public record TransactionUpdateRequest(//Transaction güncelleme isteği”nin gövdesi. Mesela PUT /transactions/{id} çağrısında body burada olur.
        @NotNull TransactionType type,//ıncome,expense
        @NotBlank @Size(max = 50) String category,
        @Size(max = 255) String description,
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
        @NotBlank @Size(min = 3, max = 3) String currency,//try,usd,eur
        @NotNull LocalDate transactionDate
) {}//Güncelleme”de userId yok → çünkü userId genelde değiştirilemez, zaten transaction kime aitse odur.

