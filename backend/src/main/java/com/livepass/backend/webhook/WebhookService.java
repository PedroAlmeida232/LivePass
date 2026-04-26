package com.livepass.backend.webhook;

import com.livepass.backend.checkout.model.Ticket;
import com.livepass.backend.repository.TicketRepository;
import com.livepass.backend.ticket.service.TotpService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class WebhookService {

    private final TicketRepository ticketRepository;
    private final TotpService totpService;

    @Transactional
    public void processPayment(Map<String, Object> payload) {
        String orderId = (String) payload.get("id");
        String status = (String) payload.get("status");

        ticketRepository.findByOrderId(orderId).ifPresent(ticket -> {
            if (ticket.getStatus() == Ticket.Status.PAID) {
                return; // Idempotency: already processed
            }

            if ("PAID".equals(status)) {
                ticket.setStatus(Ticket.Status.PAID);
                ticket.setTotpSecret(totpService.generateSecret());
                ticketRepository.save(ticket);
            } else if ("CANCELLED".equals(status) || "DECLINED".equals(status)) {
                ticket.setStatus(Ticket.Status.CANCELLED);
                ticketRepository.save(ticket);
            }
        });
    }
}
