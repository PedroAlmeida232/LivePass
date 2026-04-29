package com.livepass.backend.auth.controller;

import com.livepass.backend.auth.dto.AuthResponse;
import com.livepass.backend.auth.dto.LoginRequest;
import com.livepass.backend.auth.dto.RegisterRequest;
import com.livepass.backend.auth.model.User;
import com.livepass.backend.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/promote/{email}")
    public ResponseEntity<Void> promoteToStaff(@PathVariable String email) {
        authService.promoteToStaff(email);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getMe(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                AuthResponse.builder()
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build()
        );
    }
}
