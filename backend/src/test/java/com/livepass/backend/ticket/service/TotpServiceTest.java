package com.livepass.backend.ticket.service;

import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TotpServiceTest {

    private TotpService totpService;
    private SecretGenerator secretGenerator;
    private CodeGenerator codeGenerator;

    @BeforeEach
    void setUp() {
        totpService = new TotpService();
        secretGenerator = new DefaultSecretGenerator();
        codeGenerator = new DefaultCodeGenerator();
    }

    @Test
    void generateSecret_returnsValidBase32Secret() {
        String secret = totpService.generateSecret();
        assertNotNull(secret);
        assertEquals(32, secret.length());
    }

    @Test
    void verifyToken_validToken_returnsTrue() {
        String secret = secretGenerator.generate();
        // Generate a token for the current time
        long timeBucket = System.currentTimeMillis() / 1000 / 30;
        try {
            String token = codeGenerator.generate(secret, timeBucket);
            assertTrue(totpService.verifyToken(token, secret));
        } catch (Exception e) {
            fail("Should not throw exception");
        }
    }

    @Test
    void verifyToken_invalidToken_returnsFalse() {
        String secret = secretGenerator.generate();
        assertFalse(totpService.verifyToken("000000", secret));
    }

    @Test
    void getTotpUri_returnsCorrectFormat() {
        String secret = "SECRET123";
        String email = "user@example.com";
        String uri = totpService.getTotpUri(secret, email);
        
        assertTrue(uri.contains("otpauth://totp/LivePass:user@example.com"));
        assertTrue(uri.contains("secret=SECRET123"));
        assertTrue(uri.contains("issuer=LivePass"));
    }
}
