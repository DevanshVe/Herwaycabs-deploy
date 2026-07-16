package com.herwaycabs.auth.controller;

import com.herwaycabs.auth.dto.AuthenticationRequest;
import com.herwaycabs.auth.dto.AuthenticationResponse;
import com.herwaycabs.auth.dto.RegisterRequest;
import com.herwaycabs.auth.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth") // Matches Gateway Route
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @GetMapping("/profile")
    public ResponseEntity<AuthenticationResponse> getProfile(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.herwaycabs.auth.model.User user) {
        return ResponseEntity.ok(com.herwaycabs.auth.dto.AuthenticationResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build());
    }
}
