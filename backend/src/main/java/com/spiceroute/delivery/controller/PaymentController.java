package com.spiceroute.delivery.controller;

import com.spiceroute.delivery.dto.PaymentCreateRequest;
import com.spiceroute.delivery.dto.PaymentVerifyRequest;
import com.spiceroute.delivery.entity.User;
import com.spiceroute.delivery.service.PaymentService;
import com.spiceroute.delivery.service.RecoveryPaymentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments")
public class PaymentController {

    private final PaymentService         paymentService;
    private final RecoveryPaymentService recoveryPaymentService;

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody PaymentCreateRequest req) {
        return ResponseEntity.ok(paymentService.createRazorpayOrder(req.getOrderId()));
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verify(@Valid @RequestBody PaymentVerifyRequest req) {
        return ResponseEntity.ok(paymentService.verifyPayment(
                req.getRazorpayOrderId(), req.getRazorpayPaymentId(), req.getRazorpaySignature()));
    }

    /**
     * POST /api/payments/failed
     * Called by the frontend when Razorpay fires the payment.failed event.
     * This is the clean hook for modal dismissals and explicit failures — it
     * triggers the AI recovery agent without touching any existing code paths.
     *
     * Completely additive — existing /create and /verify are UNCHANGED.
     */
    @PostMapping("/failed")
    public ResponseEntity<Map<String, String>> paymentFailed(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user) {
        try {
            Long orderId         = Long.valueOf(body.get("orderId").toString());
            String paymentId     = body.getOrDefault("razorpayPaymentId", "").toString();
            String failureReason = body.getOrDefault("failureReason", "").toString();
            String failureCode   = body.getOrDefault("failureCode",   "").toString();
            recoveryPaymentService.onPaymentFailed(orderId, paymentId, failureReason, failureCode);
            return ResponseEntity.ok(Map.of("status", "RECOVERY_TRIGGERED"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("status", "RECOVERY_SKIPPED", "reason", e.getMessage()));
        }
    }
}
