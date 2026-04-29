package com.livepass.backend.ticket.controller;

import com.livepass.backend.auth.model.User;
import com.livepass.backend.checkout.model.Ticket;
import com.livepass.backend.repository.TicketRepository;
import com.livepass.backend.ticket.dto.TicketResponse;
import com.livepass.backend.ticket.dto.TotpSeedResponse;
import com.livepass.backend.ticket.service.TotpService;
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
                        .id(t.getTicketUuid())
                        .orderId(t.getPagbankOrderId())
                        .status(t.getPaymentStatus())
                        .isUsed(t.isUsed())
                        .createdAt(t.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/{ticketUuid}/totp-seed")
    public ResponseEntity<TotpSeedResponse> getTotpSeed(
            @AuthenticationPrincipal User user,
            @PathVariable UUID ticketUuid
    ) {
        Ticket ticket = ticketRepository.findByTicketUuid(ticketUuid)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Only owner or STAFF can see the seed
        boolean isOwner = ticket.getUser().getEmail().equals(user.getEmail());
        boolean isStaff = user.getRole() == User.Role.STAFF;

        if (!isOwner && !isStaff) {
            return ResponseEntity.status(403).build();
        }

        if (ticket.getPaymentStatus() != Ticket.Status.PAID) {
            return ResponseEntity.status(400).body(null);
        }

        String secret = ticket.getTotpSecret();
        String accountName = ticket.getUser().getEmail();

        return ResponseEntity.ok(TotpSeedResponse.builder()
                .secret(secret)
                .totpUri(totpService.getTotpUri(secret, accountName))
                .build());
    }
}
