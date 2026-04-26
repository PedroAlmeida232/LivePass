package com.livepass.backend.scan.controller;

import com.livepass.backend.auth.model.User;
import com.livepass.backend.scan.dto.ScanRequest;
import com.livepass.backend.scan.dto.ScanResponse;
import com.livepass.backend.scan.service.ScanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/scan")
@RequiredArgsConstructor
public class ScanController {

    private final ScanService scanService;

    @PostMapping("/validate")
    public ResponseEntity<ScanResponse> validateTicket(
            @AuthenticationPrincipal User staff,
            @Valid @RequestBody ScanRequest request
    ) {
        ScanResponse response = scanService.validateTicket(request, staff);
        if (!response.isValid()) {
            // Depending on the failure reason, we could return different status codes.
            // For simplicity in the MVP, we return 200 with the valid=false flag.
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.ok(response);
    }
}
