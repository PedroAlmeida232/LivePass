package com.livepass.backend.webhook;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class HmacValidatorTest {

    private HmacValidator hmacValidator;
    private final String WEBHOOK_KEY = "test-key-12345";

    @BeforeEach
    void setUp() {
        hmacValidator = new HmacValidator();
        ReflectionTestUtils.setField(hmacValidator, "webhookKey", WEBHOOK_KEY);
    }

    @Test
    void validate_validSignature_returnsTrue() throws Exception {
        String payload = "{\"id\":\"ORD-123\", \"status\":\"PAID\"}";
        
        Mac sha256Hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(WEBHOOK_KEY.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256Hmac.init(secretKeySpec);
        byte[] hashBytes = sha256Hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        String signature = Base64.getEncoder().encodeToString(hashBytes);

        assertTrue(hmacValidator.validate(payload, signature));
    }

    @Test
    void validate_invalidSignature_returnsFalse() {
        String payload = "{\"id\":\"ORD-123\", \"status\":\"PAID\"}";
        String signature = "invalid-signature";

        assertFalse(hmacValidator.validate(payload, signature));
    }

    @Test
    void validate_tamperedPayload_returnsFalse() throws Exception {
        String payload = "{\"id\":\"ORD-123\", \"status\":\"PAID\"}";
        
        Mac sha256Hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(WEBHOOK_KEY.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256Hmac.init(secretKeySpec);
        byte[] hashBytes = sha256Hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        String signature = Base64.getEncoder().encodeToString(hashBytes);

        String tamperedPayload = "{\"id\":\"ORD-123\", \"status\":\"CANCELLED\"}";
        assertFalse(hmacValidator.validate(tamperedPayload, signature));
    }
}
