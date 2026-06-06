package com.finance.personel_finance.common.exception;

/**
 * Thrown when the authenticated user is not authorized
 * to perform the requested action (HTTP 403).
 */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}