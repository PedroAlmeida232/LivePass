package com.livepass.backend.scan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ScanResponse {
    private boolean valid;
    private String message;
    private OffsetDateTime usedAt;
}
