package com.livepass.backend.ticket.service;

import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import org.springframework.stereotype.Service;

import java.util.Base64;

import static dev.samstevens.totp.util.Utils.getDataUriForImage;

@Service
public class TotpService {

    private final SecretGenerator secretGenerator = new DefaultSecretGenerator();
    private final TimeProvider timeProvider = new SystemTimeProvider();
    private final CodeGenerator codeGenerator = new DefaultCodeGenerator();
    private final CodeVerifier verifier = new DefaultCodeVerifier(codeGenerator, timeProvider);

    public String generateSecret() {
        return secretGenerator.generate();
    }

    public boolean verifyToken(String token, String secret) {
        return verifier.isValidCode(secret, token);
    }

    public String getQrCodeBase64(String secret, String accountName) throws QrGenerationException {
        QrData data = new QrData.Builder()
                .label(accountName)
                .secret(secret)
                .issuer("LivePass")
                .algorithm(dev.samstevens.totp.code.HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();

        QrGenerator generator = new ZxingPngQrGenerator();
        byte[] imageData = generator.generate(data);

        return getDataUriForImage(imageData, generator.getImageMimeType());
    }

    public String getTotpUri(String secret, String accountName) {
        return String.format("otpauth://totp/LivePass:%s?secret=%s&issuer=LivePass", accountName, secret);
    }
}
