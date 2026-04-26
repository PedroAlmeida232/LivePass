package com.livepass.backend.checkout.controller;

import com.livepass.backend.auth.model.User;
import com.livepass.backend.checkout.dto.OrderStatusResponse;
import com.livepass.backend.checkout.dto.PixResponse;
import com.livepass.backend.checkout.service.CheckoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private final CheckoutService checkoutService;

    @PostMapping("/pix")
    public ResponseEntity<PixResponse> createPixCharge(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(checkoutService.createPixCharge(user));
    }

    @GetMapping("/status/{orderId}")
    public ResponseEntity<OrderStatusResponse> getOrderStatus(
            @PathVariable String orderId
    ) {
        return ResponseEntity.ok(checkoutService.getOrderStatus(orderId));
    }
}
