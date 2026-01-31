package com.finance.personel_finance.common.exception;

/**
 * Ne işe yarar?
 * - Kaynak bulunamadı (404) hatası için custom exception.
 */

public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
