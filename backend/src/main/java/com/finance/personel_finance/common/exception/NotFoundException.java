package com.finance.personel_finance.common.exception;

/**
 * Thrown when a requested resource cannot be found (HTTP 404).
 */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
