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

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {
    // Ne işe yarar? Transaction iş mantığı service'te, controller sadece yönlendirir.
    private final TransactionService service;

    /**
     * Ne işe yarar?
     * - Kullanıcı yeni gelir/gider ekler.
     * - userId artık request parametresinden gelmez, JWT token'dan alınır.
     */
    @PostMapping
    public TransactionResponse create(
            @AuthenticationPrincipal UserPrincipal me, // JWT’den gelen kullanıcı
            @Valid @RequestBody TransactionCreateRequest req
    ) {
        Long userId = me.userId();
        return service.create(userId, req); // service metodu userId’li olacak
    }

    /**
     * Ne işe yarar?
     * - Kullanıcının belirli tarih aralığındaki işlemlerini listeler.
     * - type ve category filtreleri opsiyoneldir.
     * - userId JWT token'dan gelir (başkasının verisine erişemez).
     */
    @GetMapping
    public PagedResponse<TransactionResponse> list(
            @AuthenticationPrincipal UserPrincipal me, // JWT’den gelen kullanıcı
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long userId = me.userId();

        Page<TransactionResponse> result =
                service.list(userId, from, to, type, category, page, size);

        return new PagedResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    /**
     * Ne işe yarar?
     * - Kullanıcı mevcut işlemini günceller.
     * - Güvenlik için update sırasında da userId token’dan alınır ve ownership kontrol edilir.
     */
    @PutMapping("/{id}")
    public TransactionResponse update(
            @AuthenticationPrincipal UserPrincipal me,
            @PathVariable Long id,
            @Valid @RequestBody TransactionUpdateRequest req
    ) {
        Long userId = me.userId();
        return service.update(userId, id, req); // service metodu userId’li olacak
    }

    /**
     * Ne işe yarar?
     * - Kullanıcı kendi işlemini siler.
     * - Güvenlik için delete sırasında da userId token’dan alınır ve ownership kontrol edilir.
     */
    @DeleteMapping("/{id}")
    public void delete(
            @AuthenticationPrincipal UserPrincipal me,
            @PathVariable Long id
    ) {
        Long userId = me.userId();
        service.delete(userId, id); // service metodu userId’li olacak
    }
}




//@RequestBody ne yapıyor?
    //Client’ın gönderdiği JSON body’yi alıp Java objesine çeviriyor.
    //POST ve PUT’ta kullanılıyor çünkü bu isteklerde veri body’den gelir.

    //@Valid ne yapıyor?
    //@RequestBody ile oluşturulan objenin üstündeki validation kurallarını çalıştırır.
    //Eğer TransactionCreateRequest veya TransactionUpdateRequest içindeki:
    //@NotNull
    //@NotBlank
    //@Size vb.


