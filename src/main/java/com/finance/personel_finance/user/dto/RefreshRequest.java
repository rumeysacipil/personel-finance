package com.finance.personel_finance.user.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(

        @NotBlank String refreshToken
) {}