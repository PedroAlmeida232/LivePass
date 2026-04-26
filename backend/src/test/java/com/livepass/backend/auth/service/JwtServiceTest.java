package com.livepass.backend.auth.service;

import com.livepass.backend.auth.model.User;
import com.livepass.backend.config.JwtConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private final String SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @BeforeEach
    void setUp() {
        JwtConfig jwtConfig = new JwtConfig();
        jwtConfig.setSecretKey(SECRET);
        jwtConfig.setExpiration(86400000L);
        jwtService = new JwtService(jwtConfig);
    }

    @Test
    void generateToken_validUser_tokenContainsCorrectUsername() {
        User user = User.builder().email("test@example.com").build();
        String token = jwtService.generateToken(user);
        assertNotNull(token);
        assertEquals("test@example.com", jwtService.extractUsername(token));
    }

    @Test
    void isTokenValid_validToken_returnsTrue() {
        User user = User.builder().email("test@example.com").build();
        String token = jwtService.generateToken(user);
        assertTrue(jwtService.isTokenValid(token, user));
    }

    @Test
    void isTokenValid_invalidUsername_returnsFalse() {
        User user = User.builder().email("test@example.com").build();
        User otherUser = User.builder().email("other@example.com").build();
        String token = jwtService.generateToken(user);
        assertFalse(jwtService.isTokenValid(token, otherUser));
    }
}
