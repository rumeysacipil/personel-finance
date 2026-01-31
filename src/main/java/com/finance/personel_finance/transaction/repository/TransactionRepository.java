package com.finance.personel_finance.transaction.repository;

import com.finance.personel_finance.transaction.model.entity.Transaction;
import com.finance.personel_finance.transaction.model.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * Ne işe yarar?
     * - Kullanıcının işlemlerini tarih aralığında getirir
     * - type ve category opsiyonel filtrelerdir (null gelirse filtreleme yapmaz)
     */
    @Query("""
        SELECT t FROM Transaction t
        WHERE t.userId = :userId
          AND t.transactionDate BETWEEN :from AND :to
          AND (:type IS NULL OR t.type = :type)
          AND (:category IS NULL OR t.category = :category)
    """)
    Page<Transaction> search(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("type") TransactionType type,
            @Param("category") String category,
            Pageable pageable
    );

    /**
     * Ne işe yarar?
     * - Rapor için: belirli type'a göre toplam amount döndürür (INCOME/EXPENSE)
     * - COALESCE ile null yerine 0 döner
     */
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.userId = :userId
          AND t.type = :type
          AND t.transactionDate BETWEEN :from AND :to
    """)
    BigDecimal sumAmountByType(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    /**
     * Ne işe yarar?
     * - Rapor için: (kategori -> toplam) listesi döndürür
     * - type parametreli: en sağlam JPQL kullanım
     */
    @Query("""
        SELECT t.category, COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.userId = :userId
          AND t.type = :type
          AND t.transactionDate BETWEEN :from AND :to
        GROUP BY t.category
        ORDER BY SUM(t.amount) DESC
    """)
    List<Object[]> totalsByCategory(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    /**
     * Ne işe yarar?
     * - Excel/PDF export için: kullanıcının ay içindeki tüm işlemlerini tarih desc sırayla getirir
     */
    List<Transaction> findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
            Long userId,
            LocalDate from,
            LocalDate to
    );
}
