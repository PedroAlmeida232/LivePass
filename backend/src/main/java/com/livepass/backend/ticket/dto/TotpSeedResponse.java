package com.livepass.backend.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TotpSeedResponse {
    private String totpUri;
    private String qrCodeBase64;
}
