package com.spiceroute.delivery.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spiceroute.delivery.config.AiRecoveryConfig;
import com.spiceroute.delivery.dto.RecoveryProbabilityResult;
import com.spiceroute.delivery.dto.RecoveryStatusResponse;
import com.spiceroute.delivery.entity.*;
import com.spiceroute.delivery.exception.BusinessException;
import com.spiceroute.delivery.exception.ResourceNotFoundException;
import com.spiceroute.delivery.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * AI Revenue Recovery Agent — observe → analyze → decide → act → observe loop.
 *
 * FINANCIAL SAFETY: This service NEVER sets payment amounts. It reads the
 * trusted order.totalAmount from the database. The backend (RecoveryPaymentService)
 * always validates amounts from DB before creating a Razorpay order.
 *
 * AI SAFETY: If OpenAI is unavailable the agent continues with rule-based
 * explanations. The food delivery app is NEVER affected by AI downtime.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiRecoveryAgentService {

    private final RecoveryAttemptRepository  recoveryAttemptRepository;
    private final RecoveryAuditLogRepository auditLogRepository;
    private final OrderRepository            orderRepository;
    private final PaymentRepository          paymentRepository;
    private final RecoveryProbabilityEngine  probabilityEngine;
    private final NotificationService        notificationService;
    private final AiRecoveryConfig           aiConfig;
    private final ObjectMapper               objectMapper;

    // ── Public helpers ────────────────────────────────────────────────────────

    /** Called by controller to verify a customer owns the order before triggering recovery */
    public void verifyOrderOwnership(Long orderId, Long customerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        if (!order.getCustomer().getId().equals(customerId)) {
            throw new BusinessException("Not authorised to trigger recovery for this order");
        }
    }

    // ── OBSERVE → ANALYZE → DECIDE → ACT ─────────────────────────────────────

    /**
     * Entry point called when a payment fails (fired from RecoveryPaymentService,
     * NOT from PaymentService — keeping existing code untouched).
     */
    @Transactional
    public RecoveryAttempt triggerRecovery(Long orderId, String failedPaymentId) {
        return triggerRecovery(orderId, failedPaymentId, null, null);
    }

    @Transactional
    public RecoveryAttempt triggerRecovery(Long orderId, String failedPaymentId,
                                            String failureReason, String failureCode) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        // Idempotency — one attempt per order
        if (recoveryAttemptRepository.existsByOrderId(orderId)) {
            log.info("Recovery already triggered for order {} — returning existing attempt", orderId);
            return recoveryAttemptRepository.findByOrderId(orderId).get();
        }

        // OBSERVE ─────────────────────────────────────────────────────────────
        log.info("[RECOVERY] OBSERVE — order={} customer={} amount={}",
                orderId, order.getCustomer().getId(), order.getTotalAmount());

        // ANALYZE ─────────────────────────────────────────────────────────────
        RecoveryProbabilityResult result = probabilityEngine.calculate(order);
        log.info("[RECOVERY] ANALYZE — probability={} risk={} strategy={}",
                result.getRecoveryProbability(), result.getRiskLevel(),
                result.getRecommendedStrategy());

        // DECIDE ──────────────────────────────────────────────────────────────
        RecoveryAttempt attempt = RecoveryAttempt.builder()
                .order(order)
                .customer(order.getCustomer())
                .originalPaymentId(failedPaymentId)
                .failureReason(failureReason)
                .failureCode(failureCode)
                .status(RecoveryStatus.PENDING)
                .selectedStrategy(result.getRecommendedStrategy())
                .recoveryProbability(BigDecimal.valueOf(result.getRecoveryProbability()))
                .riskLevel(result.getRiskLevel())
                .reasonsJson(toJson(result.getReasons()))
                .attemptCount(0)
                .recoveryAmount(order.getTotalAmount())   // always from DB
                .build();

        attempt = recoveryAttemptRepository.save(attempt);

        // AUDIT: payment_failed event
        audit(attempt, "PAYMENT_FAILED", null,
                "Original payment " + failedPaymentId + " failed for order " + orderId
                + (failureReason != null ? " | Reason: " + failureReason : "")
                + (failureCode   != null ? " | Code: "   + failureCode   : ""), "N_A");

        // AUDIT: history retrieved
        audit(attempt, "HISTORY_RETRIEVED", null,
                "Customer " + order.getCustomer().getId() + " history analysed", "N_A");

        // AUDIT: probability calculated
        audit(attempt, "PROBABILITY_CALCULATED", null,
                "probability=" + result.getRecoveryProbability()
                        + " risk=" + result.getRiskLevel()
                        + " reasons=" + result.getReasons(), "N_A");

        // AUDIT: strategy selected
        audit(attempt, "STRATEGY_SELECTED", result.getRecommendedStrategy(),
                "Strategy: " + result.getRecommendedStrategy()
                        + " | Risk: " + result.getRiskLevel(), "N_A");

        // ACT ─────────────────────────────────────────────────────────────────
        if (result.getRecommendedStrategy() == RecoveryStrategy.GRACEFUL_STOP) {
            attempt.setStatus(RecoveryStatus.CANCELLED);
            recoveryAttemptRepository.save(attempt);
            audit(attempt, "RECOVERY_STOPPED", RecoveryStrategy.GRACEFUL_STOP,
                    "Probability too low — stopping gracefully", "N_A");
            log.info("[RECOVERY] GRACEFUL_STOP for order {}", orderId);
        } else {
            attempt.setStatus(RecoveryStatus.IN_PROGRESS);
            recoveryAttemptRepository.save(attempt);
            // Notify customer that recovery is available
            notifyCustomerRecoveryAvailable(order, result);
            audit(attempt, "RECOVERY_INITIATED", result.getRecommendedStrategy(),
                    "Recovery notification sent to customer", "SUCCESS");
        }

        return attempt;
    }

    /**
     * Called when a recovery payment succeeds — marks attempt RECOVERED.
     */
    @Transactional
    public void markRecovered(Long attemptId, String transactionId) {
        RecoveryAttempt attempt = recoveryAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("RecoveryAttempt", attemptId));
        attempt.setStatus(RecoveryStatus.RECOVERED);
        attempt.setRecoveryTransactionId(transactionId);
        attempt.setResolvedAt(LocalDateTime.now());
        recoveryAttemptRepository.save(attempt);
        audit(attempt, "PAYMENT_SUCCEEDED", attempt.getSelectedStrategy(),
                "Recovery payment succeeded — txn " + transactionId
                        + " | ₹" + attempt.getRecoveryAmount() + " recovered", "SUCCESS");
        log.info("[RECOVERY] RECOVERED order={} txn={} amount={}",
                attempt.getOrder().getId(), transactionId, attempt.getRecoveryAmount());
    }

    /**
     * Called when a recovery payment fails again — either escalate strategy
     * or stop gracefully.
     */
    @Transactional
    public void markRetryFailed(Long attemptId) {
        RecoveryAttempt attempt = recoveryAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("RecoveryAttempt", attemptId));

        attempt.setAttemptCount(attempt.getAttemptCount() + 1);
        audit(attempt, "PAYMENT_FAILED_AGAIN", attempt.getSelectedStrategy(),
                "Attempt #" + attempt.getAttemptCount() + " failed", "FAILURE");

        if (attempt.getAttemptCount() >= aiConfig.getMaxRecoveryAttempts()) {
            // All strategies exhausted — stop
            attempt.setStatus(RecoveryStatus.FAILED);
            attempt.setResolvedAt(LocalDateTime.now());
            audit(attempt, "RECOVERY_STOPPED", RecoveryStrategy.GRACEFUL_STOP,
                    "Max attempts (" + aiConfig.getMaxRecoveryAttempts() + ") reached", "N_A");
            log.info("[RECOVERY] FAILED (exhausted) order={}", attempt.getOrder().getId());
        } else {
            // Escalate strategy: PAYMENT_RETRY → ALTERNATIVE_PAYMENT_METHOD → GRACEFUL_STOP
            RecoveryStrategy next = escalateStrategy(attempt.getSelectedStrategy());
            attempt.setSelectedStrategy(next);
            if (next == RecoveryStrategy.GRACEFUL_STOP) {
                attempt.setStatus(RecoveryStatus.CANCELLED);
                attempt.setResolvedAt(LocalDateTime.now());
                audit(attempt, "STRATEGY_CHANGED", next, "Escalated to GRACEFUL_STOP", "N_A");
            } else {
                audit(attempt, "STRATEGY_CHANGED", next,
                        "Escalated strategy → " + next, "N_A");
            }
        }
        recoveryAttemptRepository.save(attempt);
    }

    /**
     * Build a natural-language explanation of the recovery decision.
     * Uses LLM if available, falls back to rule-based text.
     */
    public String explainRecovery(Long orderId) {
        RecoveryAttempt attempt = recoveryAttemptRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("RecoveryAttempt for order", orderId));

        List<String> reasons = parseReasons(attempt.getReasonsJson());
        String strategy      = attempt.getSelectedStrategy() != null
                                ? attempt.getSelectedStrategy().name() : "UNKNOWN";
        double probability   = attempt.getRecoveryProbability() != null
                                ? attempt.getRecoveryProbability().doubleValue() : 0.0;

        if (aiConfig.isAiAvailable()) {
            try {
                return callOpenAi(buildExplainPrompt(strategy, probability, reasons,
                        attempt.getOrder().getTotalAmount()));
            } catch (Exception e) {
                log.warn("[RECOVERY] OpenAI explanation failed, using rule-based fallback: {}", e.getMessage());
            }
        }
        return buildRuleBasedExplanation(strategy, probability, reasons,
                attempt.getOrder().getTotalAmount());
    }

    // ── Scheduled expiry job ─────────────────────────────────────────────────

    @Scheduled(fixedDelay = 3_600_000) // every hour
    @Transactional
    public void expireStaleAttempts() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(aiConfig.getRecoveryExpiryHours());
        List<RecoveryAttempt> stale = recoveryAttemptRepository.findExpiredAttempts(cutoff);
        for (RecoveryAttempt a : stale) {
            a.setStatus(RecoveryStatus.EXPIRED);
            a.setResolvedAt(LocalDateTime.now());
            recoveryAttemptRepository.save(a);
            audit(a, "EXPIRED", a.getSelectedStrategy(),
                    "Recovery window exceeded " + aiConfig.getRecoveryExpiryHours() + "h", "N_A");
        }
        if (!stale.isEmpty()) {
            log.info("[RECOVERY] Expired {} stale attempt(s)", stale.size());
        }
    }

    // ── Build status response ────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public RecoveryStatusResponse getStatus(Long orderId) {
        RecoveryAttempt attempt = recoveryAttemptRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("RecoveryAttempt for order", orderId));

        List<RecoveryAuditLog> logs = auditLogRepository
                .findByAttemptIdOrderByTimestampAsc(attempt.getId());

        List<RecoveryStatusResponse.AuditLogEntry> auditEntries = logs.stream()
                .map(l -> RecoveryStatusResponse.AuditLogEntry.builder()
                        .event(l.getEvent())
                        .strategy(l.getStrategy() != null ? l.getStrategy().name() : null)
                        .details(l.getDetails())
                        .result(l.getResult())
                        .timestamp(l.getTimestamp())
                        .build())
                .collect(Collectors.toList());

        return RecoveryStatusResponse.builder()
                .attemptId(attempt.getId())
                .orderId(attempt.getOrder().getId())
                .status(attempt.getStatus())
                .selectedStrategy(attempt.getSelectedStrategy())
                .recoveryProbability(attempt.getRecoveryProbability() != null
                        ? attempt.getRecoveryProbability().doubleValue() : 0.0)
                .riskLevel(attempt.getRiskLevel())
                .reasons(parseReasons(attempt.getReasonsJson()))
                .recoveryAmount(attempt.getRecoveryAmount())
                .attemptCount(attempt.getAttemptCount())
                .recoveryGatewayOrderId(attempt.getRecoveryGatewayOrderId())
                .recoveryTransactionId(attempt.getRecoveryTransactionId())
                .failureReason(attempt.getFailureReason())
                .failureCode(attempt.getFailureCode())
                .createdAt(attempt.getCreatedAt())
                .updatedAt(attempt.getUpdatedAt())
                .auditLog(auditEntries)
                .build();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private RecoveryStrategy escalateStrategy(RecoveryStrategy current) {
        return switch (current) {
            case PAYMENT_RETRY             -> RecoveryStrategy.ALTERNATIVE_PAYMENT_METHOD;
            case ALTERNATIVE_PAYMENT_METHOD -> RecoveryStrategy.GRACEFUL_STOP;
            default                         -> RecoveryStrategy.GRACEFUL_STOP;
        };
    }

    private void notifyCustomerRecoveryAvailable(Order order, RecoveryProbabilityResult result) {
        try {
            notificationService.send(
                    order.getCustomer().getId(),
                    "Your order can be recovered! 🔄",
                    "Payment failed for Order #" + order.getId()
                            + ". Our AI assistant has a recovery plan ready. "
                            + "Open the app to retry.",
                    NotificationType.PAYMENT_UPDATE,
                    order.getId());
        } catch (Exception e) {
            log.warn("[RECOVERY] Could not notify customer: {}", e.getMessage());
        }
    }

    private void audit(RecoveryAttempt attempt, String event,
                       RecoveryStrategy strategy, String details, String result) {
        try {
            RecoveryAuditLog log = RecoveryAuditLog.builder()
                    .attempt(attempt)
                    .orderId(attempt.getOrder().getId())
                    .event(event)
                    .strategy(strategy)
                    .details(details)
                    .result(result)
                    .build();
            auditLogRepository.save(log);
        } catch (Exception e) {
            // Never let audit logging crash the main flow
            this.log.error("[RECOVERY] Audit log write failed: {}", e.getMessage());
        }
    }

    private String toJson(List<String> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            return "[]";
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> parseReasons(String json) {
        try {
            if (json == null || json.isBlank()) return List.of();
            return objectMapper.readValue(json, List.class);
        } catch (Exception e) {
            return List.of();
        }
    }

    // ── OpenAI LLM call ──────────────────────────────────────────────────────

    private String callOpenAi(String prompt) throws Exception {
        String body = objectMapper.writeValueAsString(new java.util.LinkedHashMap<>() {{
            put("model", aiConfig.getOpenAiModel());
            put("messages", List.of(
                    java.util.Map.of("role", "system",
                            "content", "You are an AI revenue recovery assistant for a food delivery platform. "
                                    + "Give concise, factual explanations based only on the data provided. "
                                    + "Never fabricate transaction facts."),
                    java.util.Map.of("role", "user", "content", prompt)
            ));
            put("max_tokens", 200);
            put("temperature", 0.3);
        }});

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + aiConfig.getOpenAiApiKey())
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> resp = aiConfig.httpClient()
                .send(req, HttpResponse.BodyHandlers.ofString());

        if (resp.statusCode() != 200) {
            throw new BusinessException("OpenAI returned " + resp.statusCode());
        }

        JsonNode node = objectMapper.readTree(resp.body());
        return node.at("/choices/0/message/content").asText("No explanation available.");
    }

    private String buildExplainPrompt(String strategy, double probability,
                                       List<String> reasons, BigDecimal amount) {
        return "A customer's payment of ₹" + amount + " failed on a food delivery order. "
                + "The AI recovery agent calculated a recovery probability of "
                + String.format("%.0f%%", probability * 100) + ". "
                + "The recommended strategy is: " + strategy + ". "
                + "Signals that influenced this decision: " + String.join("; ", reasons) + ". "
                + "In 2-3 sentences, explain why this strategy was chosen in plain language "
                + "suitable for a merchant dashboard. Be factual and concise.";
    }

    private String buildRuleBasedExplanation(String strategy, double probability,
                                              List<String> reasons, BigDecimal amount) {
        String pct = String.format("%.0f%%", probability * 100);
        StringBuilder sb = new StringBuilder();
        sb.append("Recovery probability: ").append(pct).append(". ");
        sb.append("Strategy: ").append(strategy.replace("_", " ")).append(". ");
        if (!reasons.isEmpty()) {
            sb.append("Key signals: ").append(String.join("; ", reasons)).append(".");
        }
        return sb.toString();
    }
}
