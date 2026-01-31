package com.finance.personel_finance.user.dto;

import org.apache.kafka.common.protocol.types.Field;

public record LoginRequest(String email,String password) {
}
