package com.finance.personel_finance.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;


@Component
public class JwtService {
    private final SecretKey key;
    private final String issuer;
    private final long accessTokenMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.issuer}") String issuer,
            @Value("${app.jwt.access-token-minutes}") long accessTokenMinutes
    ) {
        // HS256 için secret en az 32+ karakter olmalı
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.issuer = issuer;
        this.accessTokenMs = accessTokenMinutes * 60_000;
    }

    // Ne işe yarar? userId + email bilgisiyle token üretir.
    public String generateAccessToken(Long userId, String email) {
        long now = System.currentTimeMillis();

        return Jwts.builder()
                .issuer(issuer)
                .subject(userId.toString())   // subject = userId
                .claim("email", email)        // ekstra bilgi
                .issuedAt(new Date(now))
                .expiration(new Date(now + accessTokenMs))
                .signWith(key)
                .compact();
    }

    // Ne işe yarar? Token'ı doğrular (imza/issuer/expire) ve claim'leri verir.
    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Long extractUserId(String token) {
        return Long.valueOf(parseClaims(token).getSubject());
    }

    public String extractEmail(String token) {
        Object email = parseClaims(token).get("email");
        return email == null ? null : email.toString();
    }
}
