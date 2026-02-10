package com.finance.personel_finance.user.dto;

public record UserResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        String profileImageUrl
) {}
