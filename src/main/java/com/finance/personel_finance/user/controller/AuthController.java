package com.finance.personel_finance.user.controller;


import com.finance.personel_finance.common.exception.ConflictException;
import com.finance.personel_finance.common.exception.UnauthorizedException;
import com.finance.personel_finance.common.security.JwtService;
import com.finance.personel_finance.user.dto.*;
import com.finance.personel_finance.user.model.entity.User;
import com.finance.personel_finance.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.Instant;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String REFRESH_COOKIE = "refresh_token";
    @Value("${app.env:dev}")
    private String appEnv;

    private final UserService userService;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;


    private boolean isProd() {
        return "prod".equalsIgnoreCase(appEnv);
    }
    private ResponseCookie refreshCookie(String refreshRaw) {
        return ResponseCookie.from(REFRESH_COOKIE, refreshRaw)
                .httpOnly(true)
                .secure(isProd())                 // ✅ prod: true, dev: false
                .sameSite(isProd() ? "None" : "Lax") // ✅ prod: None, dev: Lax
                .path("/")                        // ✅ her yerde aynı
                .maxAge(Duration.ofDays(7))
                .build();
    }

    private ResponseCookie clearRefreshCookie() {
        return ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true)
                .secure(isProd())
                .sameSite(isProd() ? "None" : "Lax")
                .path("/")          // ✅ refreshCookie ile aynı olmalı
                .maxAge(0)
                .build();
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        User user = userService.register(req.firstName(), req.lastName(), req.email(), req.password());

        String access = jwtService.generateAccessToken(user.getId(), user.getEmail());

        String refreshRaw = jwtService.generateRefreshToken();
        user.setRefreshTokenHash(jwtService.sha256(refreshRaw));
        user.setRefreshTokenExpiresAt(jwtService.refreshExpiryFromNow());
        userService.save(user);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie(refreshRaw).toString())
                .body(new AuthResponse(access,refreshRaw));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        User user;
        try {
            user = userService.getByEmailOrThrow(req.email());
        } catch (RuntimeException e) {
            throw new UnauthorizedException("Invalid credentials");
        }

        if (!encoder.matches(req.password(), user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        String access = jwtService.generateAccessToken(user.getId(), user.getEmail());

        String refreshRaw = jwtService.generateRefreshToken();
        user.setRefreshTokenHash(jwtService.sha256(refreshRaw));
        user.setRefreshTokenExpiresAt(jwtService.refreshExpiryFromNow());
        userService.save(user);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie(refreshRaw).toString())
                .body(new AuthResponse(access,refreshRaw));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request) {
        String refreshRaw = null;

        if (request.getCookies() != null) {
            for (var c : request.getCookies()) {
                if (REFRESH_COOKIE.equals(c.getName())) {
                    refreshRaw = c.getValue();
                    break;
                }
            }
        }

        if (refreshRaw == null || refreshRaw.isBlank()) {
            throw new UnauthorizedException("Missing refresh token");
        }

        String incomingHash = jwtService.sha256(refreshRaw);
        User user = userService.getByRefreshTokenHashOrThrow(incomingHash);

        if (user.getRefreshTokenExpiresAt() == null || user.getRefreshTokenExpiresAt().isBefore(Instant.now())) {
            throw new UnauthorizedException("Refresh token expired");
        }

        String newAccess = jwtService.generateAccessToken(user.getId(), user.getEmail());

        // rotation
        String newRefreshRaw = jwtService.generateRefreshToken();
        user.setRefreshTokenHash(jwtService.sha256(newRefreshRaw));
        user.setRefreshTokenExpiresAt(jwtService.refreshExpiryFromNow());
        userService.save(user);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie(newRefreshRaw).toString())
                .body(new AuthResponse(newAccess, newRefreshRaw));
    }



    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {

        String refreshRaw = null;
        if (request.getCookies() != null) {
            for (var c : request.getCookies()) {
                if (REFRESH_COOKIE.equals(c.getName())) {
                    refreshRaw = c.getValue();
                    break;
                }
            }
        }

        // ✅ DB revoke dene ama hata olursa asla 500 atma
        try {
            if (refreshRaw != null && !refreshRaw.isBlank()) {
                String hash = jwtService.sha256(refreshRaw);

                // user bulunamazsa normal (token rotate olmuş olabilir)
                User user = userService.getByRefreshTokenHashOrThrow(hash);

                user.setRefreshTokenHash(null);
                user.setRefreshTokenExpiresAt(null);
                userService.save(user);
            }
        } catch (Exception ignored) {
            // intentionally ignore
        }

        // ✅ Her durumda cookie’yi temizle
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString())
                .build();
    }

}