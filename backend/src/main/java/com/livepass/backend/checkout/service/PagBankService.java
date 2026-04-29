package com.livepass.backend.checkout.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PagBankService {

    private final WebClient pagBankWebClient;

    public Mono<PagBankOrderResponse> createPixOrder(String referenceId, String customerEmail, String customerCpf, String customerName) {
        String expirationDate = OffsetDateTime.now()
                .plusMinutes(30)
                .truncatedTo(ChronoUnit.SECONDS)
                .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);

        Map<String, Object> customer = new HashMap<>();
        customer.put("name", customerName);
        customer.put("email", customerEmail);
        customer.put("tax_id", customerCpf != null ? customerCpf : "00000000000");
        customer.put("phones", List.of(Map.of(
                "country", "55",
                "area", "11",
                "number", "999999999",
                "type", "MOBILE"
        )));

        Map<String, Object> payload = Map.of(
                "reference_id", referenceId,
                "customer", customer,
                "items", List.of(Map.of(
                        "reference_id", "ticket_001",
                        "name", "LivePass Ticket",
                        "quantity", 1,
                        "unit_amount", 100
                )),
                "qr_codes", List.of(Map.of(
                        "amount", Map.of("value", 100),
                        "expiration_date", expirationDate
                ))
        );

        return pagBankWebClient.post()
                .uri("/orders")
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(PagBankOrderResponse.class)
                .onErrorResume(WebClientResponseException.class, ex -> {
                    System.err.println("PagBank API Error: " + ex.getResponseBodyAsString());
                    return Mono.error(ex);
                });
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
            String type,
            String method
    ) {}

    public record PagBankStatusResponse(
            String id,
            String status
    ) {}
}
