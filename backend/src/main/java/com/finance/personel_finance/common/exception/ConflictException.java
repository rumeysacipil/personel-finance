package com.finance.personel_finance.common.exception;

/**
 * Thrown when a resource already exists and would conflict (HTTP 409).
 * Example: registering with an email that is already in use.
 */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}