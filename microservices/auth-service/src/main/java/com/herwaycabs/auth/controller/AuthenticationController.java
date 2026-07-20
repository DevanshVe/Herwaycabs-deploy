package com.herwaycabs.auth.controller;

import com.herwaycabs.auth.dto.AuthenticationRequest;
import com.herwaycabs.auth.dto.AuthenticationResponse;
import com.herwaycabs.auth.dto.ChangePasswordRequest;
import com.herwaycabs.auth.dto.ForgotPasswordRequest;
import com.herwaycabs.auth.dto.RegisterRequest;
import com.herwaycabs.auth.dto.ResetPasswordRequest;
import com.herwaycabs.auth.dto.UpdateProfileRequest;
import com.herwaycabs.auth.dto.UserDto;
import com.herwaycabs.auth.model.User;
import com.herwaycabs.auth.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth") // Matches Gateway Route
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @GetMapping("/profile")
    public ResponseEntity<AuthenticationResponse> getProfile(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(AuthenticationResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .phoneNumber(user.getPhoneNumber())
                .gender(user.getGender())
                .build());
    }

    @PutMapping("/profile")
    public ResponseEntity<AuthenticationResponse> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody UpdateProfileRequest request) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(service.updateProfile(user, request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal User user,
            @RequestBody ChangePasswordRequest request) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Please sign in again to change your password."));
        }
        service.changePassword(user, request);
        return ResponseEntity.ok(Map.of("message", "Your password has been updated."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        String resetToken = service.forgotPassword(request.getEmail());
        // Demo: no email service is wired up, so the token is returned directly.
        return ResponseEntity.ok(Map.of(
                "resetToken", resetToken,
                "message", "Reset link generated. In production this would be emailed to you."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody ResetPasswordRequest request) {
        service.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Your password has been reset. You can now sign in."));
    }

    // Admin listing of all users (no password hashes).
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(service.getAllUsers());
    }
}
