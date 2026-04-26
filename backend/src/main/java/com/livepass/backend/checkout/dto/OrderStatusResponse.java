package com.livepass.backend.checkout.dto;

import com.livepass.backend.checkout.model.Ticket;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderStatusResponse {
    private String orderId;
    private Ticket.Status status;
}
