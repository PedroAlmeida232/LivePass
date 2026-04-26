package com.livepass.backend.checkout.service;

import com.livepass.backend.auth.model.User;
import com.livepass.backend.checkout.dto.OrderStatusResponse;
import com.livepass.backend.checkout.dto.PixResponse;
import com.livepass.backend.checkout.model.Ticket;
import com.livepass.backend.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CheckoutService {

    private final PagBankService pagBankService;
    private final TicketRepository ticketRepository;

    @Transactional
    public PixResponse createPixCharge(User user) {
        String referenceId = UUID.randomUUID().toString();
        
        var pagBankResponse = pagBankService.createPixOrder(referenceId, user.getEmail()).block();

        if (pagBankResponse == null || pagBankResponse.qr_codes().isEmpty()) {
            throw new RuntimeException("Failed to create PIX charge with PagBank");
        }

        var qrCodeData = pagBankResponse.qr_codes().get(0);
        
        Ticket ticket = Ticket.builder()
                .user(user)
                .orderId(pagBankResponse.id())
                .status(Ticket.Status.PENDING)
                .build();

        ticketRepository.save(ticket);

        return PixResponse.builder()
                .orderId(pagBankResponse.id())
                .qrCode(qrCodeData.links().stream()
                        .filter(l -> l.rel().equals("qr_code"))
                        .findFirst()
                        .map(PagBankService.Link::href)
                        .orElse(""))
                .copyPaste(qrCodeData.text())
                .expiresAt(OffsetDateTime.parse(qrCodeData.expiration_date()))
                .build();
    }

    public OrderStatusResponse getOrderStatus(String orderId) {
        Ticket ticket = ticketRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        return OrderStatusResponse.builder()
                .orderId(orderId)
                .status(ticket.getStatus())
                .build();
    }
}
