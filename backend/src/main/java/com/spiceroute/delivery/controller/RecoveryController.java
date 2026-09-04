package com.spiceroute.delivery.controller;

import com.spiceroute.delivery.dto.RecoveryDashboardResponse;
import com.spiceroute.delivery.dto.RecoveryExplainResponse;
import com.spiceroute.delivery.dto.RecoveryStatusResponse;
import com.spiceroute.delivery.entity.*;
import com.spiceroute.delivery.repository.RecoveryAttemptRepository;
import com.spiceroute.delivery.repository.RecoveryAuditLogRepository;
import com.spiceroute.delivery.service.AiRecoveryAgentService;
import com.spiceroute.delivery.service.RecoveryDemoSeederService;
import com.spiceroute.delivery.service.RecoveryPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recovery")
@RequiredArgsConstructor
@Tag(name = "AI Revenue Recovery")
public class RecoveryController {

    private final AiRecoveryAgentService     agentService;
    private final RecoveryPaymentService     recoveryPaymentService;
    private final RecoveryAttemptRepository  recoveryAttemptRepository;
    private final RecoveryAuditLogRepository auditLogRepository;
    private final RecoveryDemoSeederService  demoSeederService;

    // ── Customer: own recovery cases ─────────────────────────────────────────

    /**
     * GET /api/recovery/my
     * Returns all recovery attempts for the logged-in customer.
     * Used by the FailedOrders page to show recovery status without needing
     * the customer to know their order IDs upfront.
     */
    @GetMapping("/my")
    @Operation(summary = "Get all recovery attempts for the current customer")
    public ResponseEntity<List<RecoveryStatusResponse>> getMyRecoveries(
            @AuthenticationPrincipal User user) {
        List<RecoveryAttempt> attempts =
                recoveryAttemptRepository.findByCustomerIdOrderByCreatedAtDesc(user.getId());

        List<RecoveryStatusResponse> responses = attempts.stream()
                .map(a -> buildStatusResponse(a))
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    /**
     * GET /api/recovery/status/{orderId}
     * Customer checks recovery status for a specific failed order.
     */
    @GetMapping("/status/{orderId}")
    @Operation(summary = "Get AI recovery status for a failed order")
    public ResponseEntity<RecoveryStatusResponse> getStatus(
            @PathVariable Long orderId,
            @AuthenticationPrincipal User user) {
        RecoveryStatusResponse status = agentService.getStatus(orderId);
        validateCustomerAccess(status, user);
        return ResponseEntity.ok(status);
    }

    /**
     * POST /api/recovery/trigger/{orderId}
     * Manually trigger AI recovery for an order that hasn't been triggered yet.
     * Used when the customer comes back later (abandoned cart / delayed failure).
     */
    @PostMapping("/trigger/{orderId}")
    @Operation(summary = "Manually trigger AI recovery for an order")
    public ResponseEntity<RecoveryStatusResponse> triggerRecovery(
            @PathVariable Long orderId,
            @AuthenticationPrincipal User user) {
        // Verify ownership
        agentService.verifyOrderOwnership(orderId, user.getId());
        RecoveryAttempt attempt =
                agentService.triggerRecovery(orderId, null, "Manual recovery trigger", null);
        return ResponseEntity.ok(buildStatusResponse(attempt));
    }

    /**
     * POST /api/recovery/retry-payment/{orderId}
     */
    @PostMapping("/retry-payment/{orderId}")
    @Operation(summary = "Create a Razorpay order for recovery payment retry")
    public ResponseEntity<Map<String, Object>> retryPayment(
            @PathVariable Long orderId,
            @AuthenticationPrincipal User user) {
        Map<String, Object> rzpData =
                recoveryPaymentService.createRecoveryRazorpayOrder(orderId, user.getId());
        return ResponseEntity.ok(rzpData);
    }

    /**
     * POST /api/recovery/verify-payment
     */
    @PostMapping("/verify-payment")
    @Operation(summary = "Verify a recovery payment server-side")
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @RequestBody RecoveryVerifyRequest req,
            @AuthenticationPrincipal User user) {
        Map<String, Object> result = recoveryPaymentService.verifyRecoveryPayment(
                req.getRazorpayOrderId(),
                req.getRazorpayPaymentId(),
                req.getRazorpaySignature(),
                user.getId());
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/recovery/explain/{orderId}
     */
    @GetMapping("/explain/{orderId}")
    @Operation(summary = "Get AI natural-language explanation of recovery decision")
    public ResponseEntity<RecoveryExplainResponse> explain(
            @PathVariable Long orderId,
            @AuthenticationPrincipal User user) {
        String explanation = agentService.explainRecovery(orderId);
        boolean aiGenerated = explanation != null
                && !explanation.startsWith("Recovery probability:");
        return ResponseEntity.ok(RecoveryExplainResponse.builder()
                .orderId(orderId)
                .explanation(explanation)
                .aiGenerated(aiGenerated)
                .build());
    }

    // ── Admin / Merchant endpoints ────────────────────────────────────────────

    /**
     * GET /api/recovery/dashboard
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    @Operation(summary = "AI Recovery dashboard metrics for merchant")
    public ResponseEntity<RecoveryDashboardResponse> dashboard() {
        long totalAttempts   = recoveryAttemptRepository.countAllAttempts();
        long recovered       = recoveryAttemptRepository.countRecovered();
        long eligible        = recoveryAttemptRepository.countEligibleAttempts();
        long inProgress      = recoveryAttemptRepository.countInProgress();
        long pending         = recoveryAttemptRepository.countPending();
        long failed          = recoveryAttemptRepository.countFailed();
        long cancelled       = recoveryAttemptRepository.countCancelled();

        BigDecimal recoveredRev = recoveryAttemptRepository.sumRecoveredAmount();
        BigDecimal potentialRev = recoveryAttemptRepository.sumPotentialAmount();

        double rate = eligible > 0
                ? (double) recovered / eligible * 100.0
                : 0.0;

        BigDecimal avgRecovered = recovered > 0
                ? recoveredRev.divide(BigDecimal.valueOf(recovered), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm");
        List<RecoveryDashboardResponse.RecoveryAttemptSummary> recent =
                recoveryAttemptRepository.findAllOrderByCreatedAtDesc()
                        .stream().limit(50)
                        .map(a -> RecoveryDashboardResponse.RecoveryAttemptSummary.builder()
                                .attemptId(a.getId())
                                .orderId(a.getOrder().getId())
                                .customerName(a.getCustomer().getName())
                                .amount(a.getRecoveryAmount())
                                .status(a.getStatus().name())
                                .strategy(a.getSelectedStrategy() != null
                                        ? a.getSelectedStrategy().name() : "-")
                                .probability(a.getRecoveryProbability() != null
                                        ? a.getRecoveryProbability().doubleValue() : 0.0)
                                .createdAt(a.getCreatedAt() != null
                                        ? a.getCreatedAt().format(fmt) : "-")
                                .failureReason(a.getFailureReason())
                                .build())
                        .collect(Collectors.toList());

        return ResponseEntity.ok(RecoveryDashboardResponse.builder()
                .potentialLostRevenue(potentialRev)
                .recoveredRevenue(recoveredRev)
                .recoveryRate(Math.round(rate * 100.0) / 100.0)
                .totalFailedPayments(totalAttempts)
                .totalRecoveryAttempts(totalAttempts)
                .successfulRecoveries(recovered)
                .inProgressCount(inProgress)
                .pendingCount(pending)
                .failedCount(failed)
                .cancelledCount(cancelled)
                .averageRecoveredValue(avgRecovered)
                .recentAttempts(recent)
                .build());
    }

    /**
     * GET /api/recovery/detail/{orderId}
     */
    @GetMapping("/detail/{orderId}")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Get full recovery detail with audit trail for merchant")
    public ResponseEntity<RecoveryStatusResponse> detail(@PathVariable Long orderId) {
        return ResponseEntity.ok(agentService.getStatus(orderId));
    }

    /**
     * GET /api/recovery/admin/explain/{orderId}
     */
    @GetMapping("/admin/explain/{orderId}")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Admin: get AI explanation of recovery strategy")
    public ResponseEntity<RecoveryExplainResponse> adminExplain(@PathVariable Long orderId) {
        String explanation  = agentService.explainRecovery(orderId);
        boolean aiGenerated = explanation != null
                && !explanation.startsWith("Recovery probability:");
        return ResponseEntity.ok(RecoveryExplainResponse.builder()
                .orderId(orderId)
                .explanation(explanation)
                .aiGenerated(aiGenerated)
                .build());
    }

    /**
     * PATCH /api/recovery/{attemptId}/mark-review
     * Admin marks a recovery case for manual review.
     */
    @PatchMapping("/{attemptId}/mark-review")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Admin: mark recovery case for manual review")
    public ResponseEntity<Map<String, String>> markReview(
            @PathVariable Long attemptId,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal User admin) {
        RecoveryAttempt attempt = recoveryAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new com.spiceroute.delivery.exception.ResourceNotFoundException(
                        "RecoveryAttempt", attemptId));

        // Only meaningful if still active
        if (attempt.getStatus() == RecoveryStatus.RECOVERED) {
            return ResponseEntity.ok(Map.of("status", "ALREADY_RECOVERED",
                    "message", "This order was already recovered — no review needed."));
        }

        String note = body != null ? body.getOrDefault("note", "") : "";

        // Log the admin action
        auditLogRepository.save(RecoveryAuditLog.builder()
                .attempt(attempt)
                .orderId(attempt.getOrder().getId())
                .event("MANUAL_REVIEW")
                .details("Marked for manual review by admin " + admin.getName()
                        + (note.isBlank() ? "" : " — Note: " + note))
                .result("N_A")
                .build());

        return ResponseEntity.ok(Map.of("status", "MARKED_FOR_REVIEW",
                "message", "Recovery case flagged for manual review."));
    }

    /**
     * PATCH /api/recovery/{attemptId}/resolve
     * Admin resolves a recovery case operationally (NOT the same as payment success).
     * This closes the case without marking payment as paid — used for edge cases,
     * duplicates, or customer service resolutions.
     */
    @PatchMapping("/{attemptId}/resolve")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Admin: operationally resolve a recovery case (not a payment action)")
    public ResponseEntity<Map<String, String>> resolveCase(
            @PathVariable Long attemptId,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal User admin) {
        RecoveryAttempt attempt = recoveryAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new com.spiceroute.delivery.exception.ResourceNotFoundException(
                        "RecoveryAttempt", attemptId));

        if (attempt.getStatus() == RecoveryStatus.RECOVERED) {
            return ResponseEntity.ok(Map.of("status", "ALREADY_RECOVERED"));
        }

        String note = body != null ? body.getOrDefault("note", "") : "";

        // Mark cancelled = operationally closed, payment NOT marked as paid
        attempt.setStatus(RecoveryStatus.CANCELLED);
        attempt.setResolvedAt(LocalDateTime.now());
        recoveryAttemptRepository.save(attempt);

        auditLogRepository.save(RecoveryAuditLog.builder()
                .attempt(attempt)
                .orderId(attempt.getOrder().getId())
                .event("ADMIN_RESOLUTION")
                .details("Case resolved by admin " + admin.getName()
                        + " — Payment NOT marked as recovered. "
                        + (note.isBlank() ? "" : "Note: " + note))
                .result("N_A")
                .build());

        return ResponseEntity.ok(Map.of("status", "RESOLVED",
                "message", "Case closed by admin. Payment status unchanged."));
    }

    // ── Demo seeder ───────────────────────────────────────────────────────────

    @PostMapping("/seed-demo")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Seed demo recovery scenarios for Buildathon demo")
    public ResponseEntity<Map<String, Object>> seedDemo() {
        Map<String, Object> result = demoSeederService.seedDemoScenarios();
        return ResponseEntity.ok(result);
    }

    // ── Request / helper ──────────────────────────────────────────────────────

    @Data
    public static class RecoveryVerifyRequest {
        @NotBlank private String razorpayOrderId;
        @NotBlank private String razorpayPaymentId;
        @NotBlank private String razorpaySignature;
    }

    private void validateCustomerAccess(RecoveryStatusResponse status, User user) {
        if (user.getRole().name().contains("ADMIN") || user.getRole().name().contains("SUPER")) return;
        RecoveryAttempt attempt = recoveryAttemptRepository
                .findById(status.getAttemptId()).orElse(null);
        if (attempt != null && !attempt.getCustomer().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Not authorised to view this recovery");
        }
    }

    private RecoveryStatusResponse buildStatusResponse(RecoveryAttempt a) {
        List<com.spiceroute.delivery.entity.RecoveryAuditLog> logs =
                auditLogRepository.findByAttemptIdOrderByTimestampAsc(a.getId());

        List<RecoveryStatusResponse.AuditLogEntry> auditEntries = logs.stream()
                .map(l -> RecoveryStatusResponse.AuditLogEntry.builder()
                        .event(l.getEvent())
                        .strategy(l.getStrategy() != null ? l.getStrategy().name() : null)
                        .details(l.getDetails())
                        .result(l.getResult())
                        .timestamp(l.getTimestamp())
                        .build())
                .collect(Collectors.toList());

        List<String> reasons;
        try {
            reasons = new com.fasterxml.jackson.databind.ObjectMapper()
                    .readValue(a.getReasonsJson() != null ? a.getReasonsJson() : "[]",
                            new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {});
        } catch (Exception e) { reasons = List.of(); }

        return RecoveryStatusResponse.builder()
                .attemptId(a.getId())
                .orderId(a.getOrder().getId())
                .status(a.getStatus())
                .selectedStrategy(a.getSelectedStrategy())
                .recoveryProbability(a.getRecoveryProbability() != null
                        ? a.getRecoveryProbability().doubleValue() : 0.0)
                .riskLevel(a.getRiskLevel())
                .reasons(reasons)
                .recoveryAmount(a.getRecoveryAmount())
                .attemptCount(a.getAttemptCount())
                .recoveryGatewayOrderId(a.getRecoveryGatewayOrderId())
                .recoveryTransactionId(a.getRecoveryTransactionId())
                .failureReason(a.getFailureReason())
                .failureCode(a.getFailureCode())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .auditLog(auditEntries)
                .build();
    }
}
