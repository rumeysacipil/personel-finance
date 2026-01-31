package com.finance.personel_finance.common.exception;


/**
 * Ne işe yarar?
 * - Yetkisiz işlem (403) için custom exception.
 */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}