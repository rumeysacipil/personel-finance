package com.finance.personel_finance.common.exception;

/**
 * Thrown when authentication fails or a token is invalid/expired (HTTP 401).
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}