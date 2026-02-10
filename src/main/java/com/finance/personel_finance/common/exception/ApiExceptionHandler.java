package com.finance.personel_finance.common.exception;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String,Object>> handle(IllegalStateException ex){
        return ResponseEntity.status(502).body(Map.of("message",ex.getMessage(),
                "type","UPSTREAM_API_ERROR"));
    }
}
