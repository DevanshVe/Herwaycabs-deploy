package com.herwaycabs.auth.service;

import com.herwaycabs.auth.config.JwtService;
import com.herwaycabs.auth.dto.AuthenticationRequest;
import com.herwaycabs.auth.dto.AuthenticationResponse;
import com.herwaycabs.auth.dto.RegisterRequest;
import com.herwaycabs.auth.dto.UserDto;
import com.herwaycabs.auth.model.Role;
import com.herwaycabs.auth.model.User;
import com.herwaycabs.auth.repository.UserRepository;
import com.herwaycabs.auth.client.DriverServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final DriverServiceClient driverServiceClient;

    public AuthenticationResponse register(RegisterRequest request) {
        // Women-only platform (also rejects a missing/blank gender)
        if (request.getGender() == null || !request.getGender().equalsIgnoreCase("Female")) {
            throw new RuntimeException("Regretfully, HerWayCabs is exclusive for female users.");
        }

        // Public sign-up may only create RIDER or DRIVER accounts, never ADMIN
        Role role = request.getRole() == null ? Role.RIDER : request.getRole();
        if (role == Role.ADMIN) {
            throw new RuntimeException("Admin accounts cannot be created through sign-up.");
        }

        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .phoneNumber(request.getPhoneNumber())
                .gender(request.getGender())
                .isVerified(false)
                .build();
        User savedUser = repository.save(user);
        var jwtToken = jwtService.generateToken(user);

        // Best-effort sync to driver-service. The frontend also ensures the
        // driver record on sign-up / login, so a cold driver-service can't
        // permanently lose it.
        if (role == Role.DRIVER) {
            try {
                driverServiceClient.registerDriver(com.herwaycabs.auth.dto.DriverDto.builder()
                        .id(savedUser.getId())
                        .name(savedUser.getName())
                        .email(savedUser.getEmail())
                        .phoneNumber(savedUser.getPhoneNumber())
                        .gender(savedUser.getGender())
                        .isAvailable(false)
                        .isVerified(false)
                        .build());
            } catch (Exception e) {
                System.err.println("Failed to sync driver: " + e.getMessage());
            }
        }

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        var user = repository.findByEmail(request.getEmail()).orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    // Admin listing — all users, without password hashes.
    public List<UserDto> getAllUsers() {
        return repository.findAll().stream()
                .map(u -> UserDto.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .role(u.getRole())
                        .phoneNumber(u.getPhoneNumber())
                        .gender(u.getGender())
                        .isVerified(u.getIsVerified())
                        .build())
                .collect(Collectors.toList());
    }
}
