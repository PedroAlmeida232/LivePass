package com.livepass.backend.checkout.service;

import com.livepass.backend.auth.model.User;
import com.livepass.backend.checkout.dto.OrderStatusResponse;
import com.livepass.backend.checkout.dto.PixResponse;
import com.livepass.backend.checkout.model.Ticket;
import com.livepass.backend.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CheckoutServiceTest {

    @Mock
    private PagBankService pagBankService;
    @Mock
    private TicketRepository ticketRepository;

    @InjectMocks
    private CheckoutService checkoutService;

    private User user;
    private PagBankService.PagBankOrderResponse pagBankResponse;

    @BeforeEach
    void setUp() {
        user = User.builder().email("customer@example.com").build();
        
        pagBankResponse = new PagBankService.PagBankOrderResponse(
                "OR-123",
                "REF-123",
                List.of(new PagBankService.QrCode(
                        "QR-1",
                        "copy-paste-code",
                        OffsetDateTime.now().plusMinutes(30).toString(),
                        List.of(new PagBankService.Link("qr_code", "http://qrcode.link", "image/png", "GET"))
                )),
                "WAITING"
        );
    }

    @Test
    void createPixCharge_success_returnsPixResponseAndSavesTicket() {
        when(pagBankService.createPixOrder(anyString(), anyString())).thenReturn(Mono.just(pagBankResponse));
        
        PixResponse response = checkoutService.createPixCharge(user);

        assertNotNull(response);
        assertEquals("OR-123", response.getOrderId());
        assertEquals("copy-paste-code", response.getCopyPaste());
        assertEquals("http://qrcode.link", response.getQrCode());
        
        verify(ticketRepository, times(1)).save(any(Ticket.class));
    }

    @Test
    void createPixCharge_pagBankError_throwsException() {
        when(pagBankService.createPixOrder(anyString(), anyString())).thenReturn(Mono.empty());

        assertThrows(RuntimeException.class, () -> checkoutService.createPixCharge(user));
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void getOrderStatus_existingTicket_returnsStatus() {
        Ticket ticket = Ticket.builder()
                .orderId("OR-123")
                .status(Ticket.Status.PAID)
                .build();
        
        when(ticketRepository.findByOrderId("OR-123")).thenReturn(Optional.of(ticket));

        OrderStatusResponse response = checkoutService.getOrderStatus("OR-123");

        assertEquals(Ticket.Status.PAID, response.getStatus());
        assertEquals("OR-123", response.getOrderId());
    }

    @Test
    void getOrderStatus_nonExistingTicket_throwsException() {
        when(ticketRepository.findByOrderId(anyString())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> checkoutService.getOrderStatus("INVALID"));
    }
}
