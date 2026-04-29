package com.livepass.backend.scan.service;

import com.livepass.backend.auth.model.User;
import com.livepass.backend.checkout.model.Ticket;
import com.livepass.backend.repository.TicketRepository;
import com.livepass.backend.scan.dto.ScanRequest;
import com.livepass.backend.scan.dto.ScanResponse;
import com.livepass.backend.ticket.service.TotpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScanServiceTest {

    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private TotpService totpService;

    @InjectMocks
    private ScanService scanService;

    private User staff;
    private Ticket ticket;
    private UUID ticketId;

    @BeforeEach
    void setUp() {
        staff = User.builder().email("staff@livepass.com").role(User.Role.STAFF).build();
        ticketId = UUID.randomUUID();
        ticket = Ticket.builder()
                .id(ticketId)
                .paymentStatus(Ticket.Status.PAID)
                .totpSecret("SECRET123")
                .used(false)
                .build();
    }

    @Test
    void validateTicket_validToken_returnsValidResponse() {
        ScanRequest request = new ScanRequest(ticketId, "123456");
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(ticket));
        when(totpService.verifyToken("123456", "SECRET123")).thenReturn(true);

        ScanResponse response = scanService.validateTicket(request, staff);

        assertTrue(response.isValid());
        assertEquals("Ticket successfully validated", response.getMessage());
        assertTrue(ticket.isUsed());
        assertNotNull(ticket.getUsedAt());
        assertEquals(staff, ticket.getUsedByStaff());
        verify(ticketRepository, times(1)).save(ticket);
    }

    @Test
    void validateTicket_invalidToken_returnsInvalidResponse() {
        ScanRequest request = new ScanRequest(ticketId, "wrong");
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(ticket));
        when(totpService.verifyToken("wrong", "SECRET123")).thenReturn(false);

        ScanResponse response = scanService.validateTicket(request, staff);

        assertFalse(response.isValid());
        assertEquals("Invalid or expired TOTP token", response.getMessage());
        assertFalse(ticket.isUsed());
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void validateTicket_alreadyUsed_returnsInvalidResponse() {
        ticket.setUsed(true);
        ticket.setUsedAt(OffsetDateTime.now());
        ScanRequest request = new ScanRequest(ticketId, "123456");
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(ticket));

        ScanResponse response = scanService.validateTicket(request, staff);

        assertFalse(response.isValid());
        assertTrue(response.getMessage().contains("already been used"));
        verify(totpService, never()).verifyToken(any(), any());
    }

    @Test
    void validateTicket_notPaid_returnsInvalidResponse() {
        ticket.setPaymentStatus(Ticket.Status.PENDING);
        ScanRequest request = new ScanRequest(ticketId, "123456");
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(ticket));

        ScanResponse response = scanService.validateTicket(request, staff);

        assertFalse(response.isValid());
        assertEquals("Ticket has not been paid yet", response.getMessage());
    }
}
