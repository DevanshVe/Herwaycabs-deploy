package com.herwaycabs.auth.service;

import com.herwaycabs.auth.config.JwtService;
import com.herwaycabs.auth.dto.AuthenticationRequest;
import com.herwaycabs.auth.dto.AuthenticationResponse;
import com.herwaycabs.auth.dto.RegisterRequest;
import com.herwaycabs.auth.model.User;
import com.herwaycabs.auth.repository.UserRepository;
import com.herwaycabs.auth.client.DriverServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

        private final UserRepository repository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;
        private final DriverServiceClient driverServiceClient;

        public AuthenticationResponse register(RegisterRequest request) {
                // Gender Enforcement
                if (request.getGender() != null && !request.getGender().equalsIgnoreCase("Female")) {
                        throw new RuntimeException("Regretfully, HerWayCabs is exclusive for female users.");
                }

                var user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(request.getRole())
                                .phoneNumber(request.getPhoneNumber())
                                .gender(request.getGender())
                                .isVerified(false)
                                .build();
                User savedUser = repository.save(user);
                var jwtToken = jwtService.generateToken(user);

                // Sync with Driver Service if role is DRIVER
                if ("DRIVER".equalsIgnoreCase(savedUser.getRole().name())) {
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
                                // Log error but allow auth registration to proceed (soft consistency)
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
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));
                var user = repository.findByEmail(request.getEmail())
                                .orElseThrow();
                var jwtToken = jwtService.generateToken(user);
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .id(user.getId())
                                .name(user.getName())
                                .email(user.getEmail())
                                .role(user.getRole())
                                .build();
        }
}
