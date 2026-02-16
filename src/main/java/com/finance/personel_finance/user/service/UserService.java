package com.finance.personel_finance.user.service;

import com.finance.personel_finance.common.exception.UnauthorizedException;
import com.finance.personel_finance.user.dto.UserResponse;
import com.finance.personel_finance.user.model.entity.User;
import com.finance.personel_finance.user.repository.UserRepository;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );


    public User register(String firstName, String lastName, String email, String rawPassword) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already in use");
        }

        User user = User.builder()
                .firstName(firstName.trim())
                .lastName(lastName.trim())
                .email(email.toLowerCase().trim())
                .password(passwordEncoder.encode(rawPassword))
                .profileImageUrl(null)
                .build();

        return userRepository.save(user);
    }

    public UserResponse updateProfile(Long userId, String firstName, String lastName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFirstName(firstName);
        user.setLastName(lastName);

        userRepository.save(user);

        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getProfileImageUrl()
        );
    }


    public User getByEmailOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }


    public UserResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getProfileImageUrl()
        );
    }


    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Old password incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public String uploadAvatar(Long userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Only JPG, PNG, WEBP allowed");
        }

        // (İstersen limit) 2MB örnek
        long maxBytes = 2 * 1024 * 1024;
        if (file.getSize() > maxBytes) {
            throw new IllegalArgumentException("Max file size is 2MB");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            Path uploadDir = Paths.get("uploads");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String ext = guessExt(contentType); // .jpg/.png/.webp
            String fileName = UUID.randomUUID() + ext;

            Path target = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            // DB'ye public URL kaydet
            String publicUrl = "/uploads/" + fileName;
            user.setProfileImageUrl(publicUrl);
            userRepository.save(user);

            return publicUrl;

        } catch (IOException e) {
            throw new RuntimeException("Upload failed");
        }
    }

    private String guessExt(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> "";
        };
    }
    public void save(User user) {
        userRepository.save(user);
    }

    public User getByRefreshTokenHashOrThrow(String hash) {
        return userRepository.findByRefreshTokenHash(hash)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));
    }

}

