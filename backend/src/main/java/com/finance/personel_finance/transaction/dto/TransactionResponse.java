package com.finance.personel_finance.transaction.dto;

import com.finance.personel_finance.transaction.model.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;


 //Yani API’ye gelen isteğin gövdesini (request) ve API’den dönen cevabı (response) taşımak için kullanılan, sadece veri tutan sınıflar.
//Record’ların güzel yanı: Java otomatik olarak constructor, get metotları (record’da field() şeklinde), equals/hashCode/toString üretir. Sen tek tek yazmazsın.
public record TransactionResponse(
        Long id,
        Long userId,
        TransactionType type,
        String category,
        String description,
        BigDecimal amount,
        String currency,
        LocalDate transactionDate
) { }//Bu, API’nin dışarıya döndüğü model.
