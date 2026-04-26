package com.livepass.backend.scan.service;

import com.livepass.backend.auth.model.User;
import com.livepass.backend.checkout.model.Ticket;
import com.livepass.backend.repository.TicketRepository;
import com.livepass.backend.scan.dto.ScanRequest;
import com.livepass.backend.scan.dto.ScanResponse;
import com.livepass.backend.ticket.service.TotpService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class ScanService {

    private final TicketRepository ticketRepository;
    private final TotpService totpService;

    @Transactional
    public ScanResponse validateTicket(ScanRequest request, User staff) {
        Ticket ticket = ticketRepository.findById(request.getTicketId())
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getStatus() != Ticket.Status.PAID) {
            return ScanResponse.builder()
                    .valid(false)
                    .message("Ticket has not been paid yet")
                    .build();
        }

        if (ticket.isUsed()) {
            return ScanResponse.builder()
                    .valid(false)
                    .message("Ticket has already been used at " + ticket.getUsedAt())
                    .build();
        }

        boolean isTokenValid = totpService.verifyToken(request.getTotpToken(), ticket.getTotpSecret());

        if (!isTokenValid) {
            return ScanResponse.builder()
                    .valid(false)
                    .message("Invalid or expired TOTP token")
                    .build();
        }

        // Mark as used
        ticket.setUsed(true);
        ticket.setUsedAt(OffsetDateTime.now());
        ticket.setUsedByStaff(staff);
        ticketRepository.save(ticket);

        return ScanResponse.builder()
                .valid(true)
                .message("Ticket successfully validated")
                .usedAt(ticket.getUsedAt())
                .build();
    }
}
