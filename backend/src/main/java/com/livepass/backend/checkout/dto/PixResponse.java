package com.livepass.backend.checkout.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PixResponse {
    private String orderId;
    private String qrCode;
    private String copyPaste;
    private OffsetDateTime expiresAt;
}
