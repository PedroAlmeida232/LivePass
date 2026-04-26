package com.livepass.backend.checkout.service;

import com.livepass.backend.checkout.dto.PixResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PagBankService {

    private final WebClient pagBankWebClient;

    public Mono<PagBankOrderResponse> createPixOrder(String referenceId, String customerEmail) {
        // Simple implementation for Sprint 2 - building the payload manually for brevity
        Map<String, Object> payload = Map.of(
                "reference_id", referenceId,
                "customer", Map.of(
                        "name", "Customer Name",
                        "email", customerEmail,
                        "tax_id", "12345678909",
                        "phones", List.of(Map.of(
                                "country", "55",
                                "area", "11",
                                "number", "999999999",
                                "type", "MOBILE"
                        ))
                ),
                "items", List.of(Map.of(
                        "reference_id", "ticket_001",
                        "name", "LivePass Ticket",
                        "quantity", 1,
                        "unit_amount", 100 // Value in cents (R$ 1,00)
                )),
                "qr_codes", List.of(Map.of(
                        "amount", Map.of("value", 100),
                        "expiration_date", OffsetDateTime.now().plusMinutes(30).toString()
                ))
        );

        return pagBankWebClient.post()
                .uri("/orders")
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(PagBankOrderResponse.class);
    }

    public Mono<PagBankStatusResponse> getOrderStatus(String orderId) {
        return pagBankWebClient.get()
                .uri("/orders/{orderId}", orderId)
                .retrieve()
                .bodyToMono(PagBankStatusResponse.class);
    }

    // PagBank API Response Mapping
    public record PagBankOrderResponse(
            String id,
            String reference_id,
            List<QrCode> qr_codes,
            String status
    ) {}

    public record QrCode(
            String id,
            String text,
            String expiration_date,
            List<Link> links
    ) {}

    public record Link(
            String rel,
            String href,
            String media,
            String type
    ) {}

    public record PagBankStatusResponse(
            String id,
            String status
    ) {}
}
