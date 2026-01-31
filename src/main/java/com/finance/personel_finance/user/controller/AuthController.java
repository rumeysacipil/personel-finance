package com.finance.personel_finance.user.controller;


import com.finance.personel_finance.common.exception.ConflictException;
import com.finance.personel_finance.common.exception.UnauthorizedException;
import com.finance.personel_finance.common.security.JwtService;
import com.finance.personel_finance.user.dto.AuthResponse;
import com.finance.personel_finance.user.dto.LoginRequest;
import com.finance.personel_finance.user.dto.RegisterRequest;
import com.finance.personel_finance.user.model.entity.User;
import com.finance.personel_finance.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    /**
     * Ne işe yarar?
     * - Yeni kullanıcı kaydı
     * - Email zaten varsa 409 döner
     */
    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest req) {
        try {
            User user = userService.register(req.email(), req.password());
            String token = jwtService.generateAccessToken(user.getId(), user.getEmail());
            return new AuthResponse(token);
        } catch (RuntimeException e) {
            // userService içinde "Email already in use" fırlatıyorsun ya:
            // onu 409'a çeviriyoruz
            throw new ConflictException(e.getMessage());
        }
    }

    /**
     * Ne işe yarar?
     * - Login
     * - Kullanıcı yoksa veya şifre yanlışsa 401 döner
     */
    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest req) {
        User user;
        try {
            user = userService.getByEmailOrThrow(req.email());
        } catch (RuntimeException e) {
            // Güvenlik için "user not found" yerine generic hata
            throw new UnauthorizedException("Invalid credentials");
        }

        if (!encoder.matches(req.password(), user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        String token = jwtService.generateAccessToken(user.getId(), user.getEmail());
        return new AuthResponse(token);
    }
}