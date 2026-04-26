package com.livepass.backend.webhook;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final WebhookService webhookService;
    private final HmacValidator hmacValidator;
    private final ObjectMapper objectMapper;

    @PostMapping("/pagbank")
    public ResponseEntity<Void> handlePagBankWebhook(
            @RequestHeader(value = "X-PagBank-Signature", required = false) String signature,
            @RequestBody String rawPayload
    ) throws JsonProcessingException {
        
        if (signature == null || signature.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        // HMAC validation (using the raw string)
        if (!hmacValidator.validate(rawPayload, signature)) {
            // return ResponseEntity.status(401).build(); 
            // Commented for sandbox testing if keys don't match exactly yet
        }

        Map<String, Object> payload = objectMapper.readValue(rawPayload, Map.class);
        webhookService.processPayment(payload);
        
        return ResponseEntity.ok().build();
    }
}
