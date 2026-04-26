package com.livepass.backend.auth.service;

import com.livepass.backend.auth.dto.AuthResponse;
import com.livepass.backend.auth.dto.LoginRequest;
import com.livepass.backend.auth.dto.RegisterRequest;
import com.livepass.backend.auth.model.User;
import com.livepass.backend.exception.DuplicateEmailException;
import com.livepass.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User user;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .email("test@example.com")
                .password("password123")
                .build();

        loginRequest = LoginRequest.builder()
                .email("test@example.com")
                .password("password123")
                .build();

        user = User.builder()
                .email("test@example.com")
                .password("encodedPassword")
                .role(User.Role.CUSTOMER)
                .build();
    }

    @Test
    void register_duplicateEmail_throwsDuplicateEmailException() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));

        assertThrows(DuplicateEmailException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_success_returnsAuthResponse() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(jwtService.generateToken(any())).thenReturn("token");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("test@example.com", response.getEmail());
        assertEquals("token", response.getToken());
        verify(userRepository, times(1)).save(any());
    }

    @Test
    void login_wrongPassword_throwsBadCredentialsException() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(loginRequest));
    }

    @Test
    void login_success_returnsAuthResponse() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any())).thenReturn("token");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("test@example.com", response.getEmail());
        assertEquals("token", response.getToken());
    }
}
