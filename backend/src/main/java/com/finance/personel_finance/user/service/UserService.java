package com.finance.personel_finance.user.service;

import com.finance.personel_finance.common.exception.ConflictException;
import com.finance.personel_finance.common.exception.NotFoundException;
import com.finance.personel_finance.common.exception.UnauthorizedException;
import com.finance.personel_finance.user.dto.UserResponse;
import com.finance.personel_finance.user.model.entity.User;
import com.finance.personel_finance.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Set;
import java.util.UUID;

/**
 * Handles user registration, profile management, avatar uploads,
 * and refresh-token persistence.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );
    private static final long MAX_AVATAR_BYTES = 10 * 1024 * 1024; // 10 MB

    /**
     * Registers a new user after verifying email uniqueness.
     *
     * @throws ConflictException if the email is already in use
     */
    public User register(String firstName, String lastName, String email, String rawPassword) {
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email already in use");
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

    /**
     * Updates the user's first and last name.
     *
     * @throws NotFoundException if the user does not exist
     */
    public UserResponse updateProfile(Long userId, String firstName, String lastName) {
        User user = findByIdOrThrow(userId);
        user.setFirstName(firstName.trim());
        user.setLastName(lastName.trim());
        userRepository.save(user);
        return toResponse(user);
    }

    /**
     * Retrieves a user by email.
     *
     * @throws NotFoundException if no user exists with the given email
     */
    public User getByEmailOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    /**
     * Returns the public profile for the given user id.
     *
     * @throws NotFoundException if the user does not exist
     */
    public UserResponse getProfile(Long userId) {
        User user = findByIdOrThrow(userId);
        return toResponse(user);
    }

    /**
     * Changes the user's password after verifying the old one.
     *
     * @throws NotFoundException        if the user does not exist
     * @throws IllegalArgumentException if the old password is incorrect
     */
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = findByIdOrThrow(userId);

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Old password incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * Uploads a profile avatar image (JPG, PNG, or WebP, max 2 MB).
     *
     * @return the public URL of the uploaded image
     * @throws IllegalArgumentException if the file is missing, too large, or has an invalid type
     */
    public String uploadAvatar(Long userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Only JPG, PNG, WEBP allowed");
        }

        if (file.getSize() > MAX_AVATAR_BYTES) {
            throw new IllegalArgumentException("Maksimum dosya boyutu 10MB olmalıdır");
        }

        User user = findByIdOrThrow(userId);

        try {
            Path uploadDir = Paths.get("uploads");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String ext = guessExtension(contentType);
            String fileName = UUID.randomUUID() + ext;
            Path target = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            String publicUrl = "/uploads/" + fileName;
            user.setProfileImageUrl(publicUrl);
            userRepository.save(user);

            log.info("Avatar uploaded for userId={}: {}", userId, publicUrl);
            return publicUrl;

        } catch (IOException e) {
            log.error("Avatar upload failed for userId={}", userId, e);
            throw new RuntimeException("Upload failed");
        }
    }

    public void save(User user) {
        userRepository.save(user);
    }

    /**
     * Finds a user by refresh-token hash.
     *
     * @throws UnauthorizedException if no user matches the given hash
     */
    public User getByRefreshTokenHashOrThrow(String hash) {
        return userRepository.findByRefreshTokenHash(hash)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));
    }

    // ── Private helpers ─────────────────────────────────────────────

    private User findByIdOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getProfileImageUrl()
        );
    }

    private String guessExtension(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> "";
        };
    }
}
