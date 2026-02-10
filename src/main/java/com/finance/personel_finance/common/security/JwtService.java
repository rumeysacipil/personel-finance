package com.finance.personel_finance.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;


@Component
public class JwtService {
    private final SecretKey key;
    private final String issuer;
    private final long accessTokenMs;

    // ✅ refresh süresi (gün)
    private final long refreshTokenMs;

    private final SecureRandom secureRandom = new SecureRandom();

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.issuer}") String issuer,
            @Value("${app.jwt.access-token-minutes}") long accessTokenMinutes,
            @Value("${app.jwt.refresh-token-days}") long refreshTokenDays
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.issuer = issuer;
        this.accessTokenMs = accessTokenMinutes * 60_000;
        this.refreshTokenMs = refreshTokenDays * 24L * 60L * 60L * 1000L;
    }

    public String generateAccessToken(Long userId, String email) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .issuer(issuer)
                .subject(userId.toString())
                .claim("email", email)
                .issuedAt(new Date(now))
                .expiration(new Date(now + accessTokenMs))
                .signWith(key)
                .compact();
    }

    // ✅ Opaque refresh token üret (raw)
    public String generateRefreshToken() {
        byte[] bytes = new byte[64];
        secureRandom.nextBytes(bytes);
        // URL-safe olsun diye
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    // ✅ refresh token expiry
    public Instant refreshExpiryFromNow() {
        return Instant.ofEpochMilli(System.currentTimeMillis() + refreshTokenMs);
    }

    // ✅ DB’ye hash sakla
    public String sha256(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashed) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Hash error", e);
        }
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isValid(String token) {
        try { parseClaims(token); return true; }
        catch (Exception e) { return false; }
    }

    public Long extractUserId(String token) {
        return Long.valueOf(parseClaims(token).getSubject());
    }

    public String extractEmail(String token) {
        Object email = parseClaims(token).get("email");
        return email == null ? null : email.toString();
    }
}