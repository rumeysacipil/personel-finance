package com.finance.personel_finance.common.exception;


/**
 * Ne işe yarar?
 * - Çakışma durumları için 409 döndürmek (ör: aynı email ile kayıt).
 */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}