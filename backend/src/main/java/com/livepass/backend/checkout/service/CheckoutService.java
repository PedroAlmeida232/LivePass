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

    private final MercadoPagoService mercadoPagoService;
    private final TicketRepository ticketRepository;

    @Transactional
    public PixResponse createPixCharge(User user) {
        try {
            String[] nameParts = user.getFullName().split(" ", 2);
            String firstName = nameParts[0];
            String lastName = nameParts.length > 1 ? nameParts[1] : "";

            var payment = mercadoPagoService.createPixPayment(
                    user.getEmail(),
                    firstName,
                    lastName,
                    user.getCpf(),
                    new java.math.BigDecimal("1.00") // Valor fixo para MVP
            );

            Ticket ticket = Ticket.builder()
                    .user(user)
                    .pagbankOrderId(payment.getId().toString()) // Reusing the field for MP ID
                    .paymentStatus(Ticket.Status.PENDING)
                    .build();

            ticketRepository.save(ticket);

            var pointOfInteraction = payment.getPointOfInteraction();
            var transactionData = pointOfInteraction.getTransactionData();

            return PixResponse.builder()
                    .orderId(payment.getId().toString())
                    .qrCode(transactionData.getQrCodeBase64())
                    .copyPaste(transactionData.getQrCode())
                    .expiresAt(OffsetDateTime.now().plusMinutes(30))
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to create PIX charge with Mercado Pago: " + e.getMessage(), e);
        }
    }

    public OrderStatusResponse getOrderStatus(String orderId) {
        Ticket ticket = ticketRepository.findByPagbankOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        return OrderStatusResponse.builder()
                .orderId(orderId)
                .status(ticket.getPaymentStatus())
                .build();
    }
}
