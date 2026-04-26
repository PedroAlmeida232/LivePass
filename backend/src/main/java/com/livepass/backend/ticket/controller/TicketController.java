package com.livepass.backend.ticket.controller;

import com.livepass.backend.auth.model.User;
import com.livepass.backend.checkout.model.Ticket;
import com.livepass.backend.repository.TicketRepository;
import com.livepass.backend.ticket.dto.TicketResponse;
import com.livepass.backend.ticket.dto.TotpSeedResponse;
import com.livepass.backend.ticket.service.TotpService;
import dev.samstevens.totp.exceptions.QrGenerationException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketRepository ticketRepository;
    private final TotpService totpService;

    @GetMapping("/mine")
    public ResponseEntity<List<TicketResponse>> getMyTickets(
            @AuthenticationPrincipal User user
    ) {
        List<TicketResponse> tickets = ticketRepository.findByUserEmail(user.getEmail())
                .stream()
                .map(t -> TicketResponse.builder()
                        .id(t.getId())
                        .orderId(t.getOrderId())
                        .status(t.getStatus())
                        .isUsed(t.isUsed())
                        .createdAt(t.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/{id}/totp-seed")
    public ResponseEntity<TotpSeedResponse> getTotpSeed(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id
    ) throws QrGenerationException {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!ticket.getUser().getEmail().equals(user.getEmail())) {
            return ResponseEntity.status(403).build();
        }

        if (ticket.getStatus() != Ticket.Status.PAID) {
            return ResponseEntity.status(400).build();
        }

        String secret = ticket.getTotpSecret();
        String accountName = user.getEmail();

        return ResponseEntity.ok(TotpSeedResponse.builder()
                .totpUri(totpService.getTotpUri(secret, accountName))
                .qrCodeBase64(totpService.getQrCodeBase64(secret, accountName))
                .build());
    }
}
