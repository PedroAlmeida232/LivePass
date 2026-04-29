package com.livepass.backend.webhook;

import com.livepass.backend.checkout.model.Ticket;
import com.livepass.backend.checkout.service.MercadoPagoService;
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
    private final MercadoPagoService mercadoPagoService;

    @Transactional
    public void processMercadoPagoWebhook(Map<String, Object> payload) {
        String type = (String) payload.get("type");

        if ("payment".equals(type)) {
            Map<String, Object> data = (Map<String, Object>) payload.get("data");
            String paymentIdStr = (String) data.get("id");
            Long paymentId = Long.parseLong(paymentIdStr);

            try {
                var payment = mercadoPagoService.getPayment(paymentId);
                String status = payment.getStatus();

                ticketRepository.findByPagbankOrderId(paymentIdStr).ifPresent(ticket -> {
                    if (ticket.getPaymentStatus() == Ticket.Status.PAID) {
                        return; // Idempotency
                    }

                    if ("approved".equals(status)) {
                        ticket.setPaymentStatus(Ticket.Status.PAID);
                        ticket.setTotpSecret(totpService.generateSecret());
                        ticketRepository.save(ticket);
                    } else if ("cancelled".equals(status) || "rejected".equals(status)) {
                        ticket.setPaymentStatus(Ticket.Status.CANCELLED);
                        ticketRepository.save(ticket);
                    }
                });
            } catch (Exception e) {
                throw new RuntimeException("Error fetching payment details from Mercado Pago", e);
            }
        }
    }

    @Transactional
    public void processPayment(Map<String, Object> payload) {
        // Keep PagBank for backward compatibility if needed, or remove it.
        // For now, let's keep it but focus on MP.
        String orderId = (String) payload.get("id");
        String status = (String) payload.get("status");
...
        ticketRepository.findByPagbankOrderId(orderId).ifPresent(ticket -> {
            if (ticket.getPaymentStatus() == Ticket.Status.PAID) {
                return; // Idempotency: already processed
            }

            if ("PAID".equals(status)) {
                ticket.setPaymentStatus(Ticket.Status.PAID);
                ticket.setTotpSecret(totpService.generateSecret());
                ticketRepository.save(ticket);
            } else if ("CANCELLED".equals(status) || "DECLINED".equals(status)) {
                ticket.setPaymentStatus(Ticket.Status.CANCELLED);
                ticketRepository.save(ticket);
            }
        });
    }
}
