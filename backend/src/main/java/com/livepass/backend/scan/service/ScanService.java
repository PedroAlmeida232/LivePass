package com.livepass.backend.scan.service;

import com.livepass.backend.auth.model.User;
import com.livepass.backend.checkout.model.Ticket;
import com.livepass.backend.repository.ScanHistoryRepository;
import com.livepass.backend.repository.TicketRepository;
import com.livepass.backend.scan.dto.ScanRequest;
import com.livepass.backend.scan.dto.ScanResponse;
import com.livepass.backend.scan.model.ScanHistory;
import com.livepass.backend.ticket.service.TotpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScanService {

    private final TicketRepository ticketRepository;
    private final TotpService totpService;
    private final ScanHistoryRepository scanHistoryRepository;

    @Transactional
    public ScanResponse validateTicket(ScanRequest request, User staff) {
        log.info("Scan attempt by staff: {} for ticket: {}", staff.getEmail(), request.getTicketId());

        Ticket ticket = ticketRepository.findByTicketUuid(request.getTicketId())
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getPaymentStatus() != Ticket.Status.PAID) {
            recordScan(ticket, staff, "FAILED", "Ticket not paid");
            return ScanResponse.builder()
                    .valid(false)
                    .message("Ticket has not been paid yet")
                    .build();
        }

        if (ticket.isUsed()) {
            recordScan(ticket, staff, "FAILED", "Ticket already used");
            return ScanResponse.builder()
                    .valid(false)
                    .message("Ticket has already been used at " + ticket.getUsedAt())
                    .build();
        }

        boolean isTokenValid = totpService.verifyToken(request.getTotpToken(), ticket.getTotpSecret());

        if (!isTokenValid) {
            recordScan(ticket, staff, "FAILED", "Invalid TOTP token");
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

        recordScan(ticket, staff, "SUCCESS", "Validated");

        log.info("Scan success: Ticket {} validated by staff {}", ticket.getId(), staff.getEmail());

        return ScanResponse.builder()
                .valid(true)
                .message("Ticket successfully validated")
                .usedAt(ticket.getUsedAt())
                .build();
    }

    private void recordScan(Ticket ticket, User staff, String status, String reason) {
        ScanHistory history = ScanHistory.builder()
                .ticket(ticket)
                .staff(staff)
                .status(status)
                .reason(reason)
                .build();
        scanHistoryRepository.save(history);
    }
}
