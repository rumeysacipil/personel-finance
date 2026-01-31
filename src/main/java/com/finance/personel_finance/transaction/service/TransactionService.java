package com.finance.personel_finance.transaction.service;

import com.finance.personel_finance.common.exception.ForbiddenException;
import com.finance.personel_finance.common.exception.NotFoundException;
import com.finance.personel_finance.transaction.dto.TransactionCreateRequest;
import com.finance.personel_finance.transaction.dto.TransactionResponse;
import com.finance.personel_finance.transaction.dto.TransactionUpdateRequest;
import com.finance.personel_finance.transaction.model.entity.Transaction;
import com.finance.personel_finance.transaction.model.enums.TransactionType;
import com.finance.personel_finance.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class TransactionService {

    // Ne işe yarar? DB işlemleri için repository
    private final TransactionRepository repo;

    /**
     * Ne işe yarar?
     * - Yeni transaction oluşturur.
     * - userId JWT’den gelir, request body’den değil.
     */

    @CacheEvict(value = "monthlyReports", allEntries = true)
    public TransactionResponse create(Long userId, TransactionCreateRequest req) {

        Transaction t = Transaction.builder()
                .userId(userId) // ✅ JWT’den gelen userId
                .type(req.type())
                .category(req.category())
                .description(req.description())
                .amount(req.amount())
                .currency(req.currency())
                .transactionDate(req.transactionDate())
                .build();

        return toResponse(repo.save(t));
    }

    /**
     * Ne işe yarar?
     * - Kullanıcıya ait belirli tarih aralığındaki işlemleri sayfalı listeler.
     * - type ve category filtreleri opsiyoneldir.
     */
    public Page<TransactionResponse> list(
            Long userId,
            LocalDate from,
            LocalDate to,
            TransactionType type,
            String category,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "transactionDate")
        );

        return repo.search(userId, from, to, type, category, pageable)
                .map(this::toResponse);
    }

    /**
     * Ne işe yarar?
     * - Transaction günceller.
     * - Güvenlik: kullanıcı sadece kendi transaction’ını güncelleyebilir.
     * - Hata türleri:
     *   - 404: transaction yok
     *   - 403: başka kullanıcıya ait
     */

    @CacheEvict(value = "monthlyReports", allEntries = true)
    public TransactionResponse update(Long userId, Long transactionId, TransactionUpdateRequest req) {

        Transaction t = repo.findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found: " + transactionId));

        // ✅ Ownership kontrol (başkasının verisini güncellemesin)
        if (!t.getUserId().equals(userId)) {
            throw new ForbiddenException("You are not allowed to update this transaction.");
        }

        t.setType(req.type());
        t.setCategory(req.category());
        t.setDescription(req.description());
        t.setAmount(req.amount());
        t.setCurrency(req.currency());
        t.setTransactionDate(req.transactionDate());

        return toResponse(repo.save(t));
    }

    /**
     * Ne işe yarar?
     * - Transaction siler.
     * - Güvenlik: kullanıcı sadece kendi transaction’ını silebilir.
     * - Hata türleri:
     *   - 404: transaction yok
     *   - 403: başka kullanıcıya ait
     */
    @CacheEvict(value = "monthlyReports", allEntries = true)
    public void delete(Long userId, Long transactionId) {

        Transaction t = repo.findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found: " + transactionId));

        // ✅ Ownership kontrol
        if (!t.getUserId().equals(userId)) {
            throw new ForbiddenException("You are not allowed to delete this transaction.");
        }

        repo.deleteById(transactionId);
    }

    /**
     * Ne işe yarar?
     * - Entity → Response dönüşümü (tek format)
     */
    private TransactionResponse toResponse(Transaction t) {
        return new TransactionResponse(
                t.getId(),
                t.getUserId(),
                t.getType(),
                t.getCategory(),
                t.getDescription(),
                t.getAmount(),
                t.getCurrency(),
                t.getTransactionDate()
        );
    }
}
