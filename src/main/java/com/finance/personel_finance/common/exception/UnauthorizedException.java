package com.finance.personel_finance.common.exception;
/**
 * Ne işe yarar?
 * - Authentication hataları için 401 döndürmek.
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}