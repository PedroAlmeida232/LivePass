package com.livepass.backend.ticket.dto;

import com.livepass.backend.checkout.model.Ticket;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TicketResponse {
    private UUID id;
    private String orderId;
    private Ticket.Status status;
    private boolean isUsed;
    private OffsetDateTime createdAt;
}
