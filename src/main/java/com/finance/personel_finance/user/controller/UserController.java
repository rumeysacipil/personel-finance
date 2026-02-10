package com.finance.personel_finance.user.controller;


import com.finance.personel_finance.common.exception.UnauthorizedException;
import com.finance.personel_finance.common.security.UserPrincipal;
import com.finance.personel_finance.user.dto.ChangePasswordRequest;
import com.finance.personel_finance.user.dto.UpdateProfileRequest;
import com.finance.personel_finance.user.dto.UserResponse;
import com.finance.personel_finance.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal UserPrincipal me) {
        return userService.getProfile(me.userId());
    }

    @PutMapping("/password")
    public void changePassword(
            @AuthenticationPrincipal UserPrincipal me,
            @Valid @RequestBody ChangePasswordRequest req
    ) {
        try {
            userService.changePassword(me.userId(), req.oldPassword(), req.newPassword());
        } catch (IllegalArgumentException e) {
            // eski şifre yanlış gibi durumlarda 401 dönelim
            throw new UnauthorizedException(e.getMessage());
        }
    }
    @PutMapping("/me")
    public UserResponse updateProfile(
            @AuthenticationPrincipal UserPrincipal me,
            @Valid @RequestBody UpdateProfileRequest req
    ) {
        return userService.updateProfile(
                me.userId(),
                req.firstName(),
                req.lastName()
        );
    }


    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserResponse uploadAvatar(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestParam("file") MultipartFile file
    ) {
        String url = userService.uploadAvatar(me.userId(), file);
        // profili geri dönelim ki FE hemen güncellesin
        return userService.getProfile(me.userId());
    }
}
