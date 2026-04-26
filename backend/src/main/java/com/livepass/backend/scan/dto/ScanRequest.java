package com.livepass.backend.scan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ScanRequest {
    @NotNull(message = "Ticket UUID is required")
    private UUID ticketId;

    @NotBlank(message = "TOTP token is required")
    private String totpToken;
}
