package com.livepass.backend.webhook;

import com.livepass.backend.checkout.model.Ticket;
import com.livepass.backend.repository.TicketRepository;
import com.livepass.backend.ticket.service.TotpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WebhookServiceTest {

    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private TotpService totpService;

    @InjectMocks
    private WebhookService webhookService;

    private Ticket ticket;

    @BeforeEach
    void setUp() {
        ticket = Ticket.builder()
                .orderId("ORD-123")
                .status(Ticket.Status.PENDING)
                .build();
    }

    @Test
    void processPayment_alreadyPaid_doesNotModifyTicket() {
        ticket.setStatus(Ticket.Status.PAID);
        when(ticketRepository.findByOrderId("ORD-123")).thenReturn(Optional.of(ticket));

        webhookService.processPayment(Map.of("id", "ORD-123", "status", "PAID"));

        verify(ticketRepository, never()).save(any());
        verify(totpService, never()).generateSecret();
    }

    @Test
    void processPayment_pendingTicket_updatesStatusToPaidAndGeneratesSecret() {
        when(ticketRepository.findByOrderId("ORD-123")).thenReturn(Optional.of(ticket));
        when(totpService.generateSecret()).thenReturn("NEW-SECRET");

        webhookService.processPayment(Map.of("id", "ORD-123", "status", "PAID"));

        assertEquals(Ticket.Status.PAID, ticket.getStatus());
        assertEquals("NEW-SECRET", ticket.getTotpSecret());
        verify(ticketRepository, times(1)).save(ticket);
    }

    @Test
    void processPayment_statusCancelled_updatesStatusToCancelled() {
        when(ticketRepository.findByOrderId("ORD-123")).thenReturn(Optional.of(ticket));

        webhookService.processPayment(Map.of("id", "ORD-123", "status", "CANCELLED"));

        assertEquals(Ticket.Status.CANCELLED, ticket.getStatus());
        verify(ticketRepository, times(1)).save(ticket);
        verify(totpService, never()).generateSecret();
    }
}
