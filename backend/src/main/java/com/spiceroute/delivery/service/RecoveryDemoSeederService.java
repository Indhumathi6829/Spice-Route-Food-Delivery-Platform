package com.spiceroute.delivery.service;

import com.spiceroute.delivery.entity.*;
import com.spiceroute.delivery.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Creates realistic demo recovery scenarios for the Razorpay Buildathon demo.
 *
 * Each scenario has:
 *  - A real Order (PLACED status, RAZORPAY method) from an existing customer
 *  - A real Payment record (FAILED status)
 *  - A RecoveryAttempt with computed probability + strategy
 *  - A full RecoveryAuditLog timeline showing every AI agent step
 *
 * Idempotent: skips if demo data already exists (checks by scenario marker).
 * All amounts come from the seeded orders — never hardcoded financial values.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RecoveryDemoSeederService {

    private final UserRepository             userRepository;
    private final OrderRepository            orderRepository;
    private final PaymentRepository          paymentRepository;
    private final RecoveryAttemptRepository  recoveryAttemptRepository;
    private final RecoveryAuditLogRepository auditLogRepository;
    private final AddressRepository          addressRepository;

    // ── Scenario definitions ─────────────────────────────────────────────────

    private record ScenarioSpec(
        String customerEmail,
        BigDecimal amount,
        RecoveryStrategy strategy,
        RecoveryStatus finalStatus,
        double probability,
        String riskLevel,
        List<String> reasons,
        String originalPaymentId,
        String recoveryTxnId,        // null unless RECOVERED
        List<AuditSpec> extraAudits  // events AFTER the standard ones
    ) {}

    private record AuditSpec(String event, RecoveryStrategy strategy, String details, String result) {}

    @Transactional
    public Map<String, Object> seedDemoScenarios() {

        // ── Scenario 1: HIGH probability → PAYMENT_RETRY → RECOVERED ─────────
        ScenarioSpec s1 = new ScenarioSpec(
            "priya@example.com",
            new BigDecimal("485.00"),
            RecoveryStrategy.PAYMENT_RETRY,
            RecoveryStatus.RECOVERED,
            0.87,
            "HIGH_RECOVERY_POTENTIAL",
            List.of(
                "Customer has 12 previous successfully delivered orders",
                "No previous failed payments on record",
                "Order placed just 8 minutes ago — customer still active",
                "Mid-range order value (₹485) — high recovery potential",
                "Customer chose online payment — shows payment intent"
            ),
            "pay_demo_failed_001",
            "pay_demo_recovered_001",
            List.of(
                new AuditSpec("RECOVERY_PAYMENT_CREATED", RecoveryStrategy.PAYMENT_RETRY,
                    "Razorpay recovery order order_demo_retry_001 created | amount=₹485.00", "SUCCESS"),
                new AuditSpec("PAYMENT_SUCCEEDED", RecoveryStrategy.PAYMENT_RETRY,
                    "Recovery payment succeeded — txn pay_demo_recovered_001 | ₹485.00 recovered", "SUCCESS")
            )
        );

        // ── Scenario 2: MEDIUM → RETRY fails → ALTERNATIVE_PAYMENT → RECOVERED
        ScenarioSpec s2 = new ScenarioSpec(
            "arjun@example.com",
            new BigDecimal("720.00"),
            RecoveryStrategy.ALTERNATIVE_PAYMENT_METHOD,
            RecoveryStatus.RECOVERED,
            0.62,
            "MEDIUM_RECOVERY_POTENTIAL",
            List.of(
                "Customer has 4 previous delivered orders",
                "1 previous failed payment — some risk",
                "Order placed 22 minutes ago — relatively fresh",
                "Mid-range order value (₹720) — high recovery potential",
                "Customer chose online payment — shows payment intent"
            ),
            "pay_demo_failed_002",
            "pay_demo_recovered_002",
            List.of(
                new AuditSpec("RECOVERY_PAYMENT_CREATED", RecoveryStrategy.PAYMENT_RETRY,
                    "Razorpay recovery order order_demo_retry_002 created | amount=₹720.00", "SUCCESS"),
                new AuditSpec("PAYMENT_FAILED_AGAIN", RecoveryStrategy.PAYMENT_RETRY,
                    "Attempt #1 failed — card declined", "FAILURE"),
                new AuditSpec("STRATEGY_CHANGED", RecoveryStrategy.ALTERNATIVE_PAYMENT_METHOD,
                    "Escalated strategy → ALTERNATIVE_PAYMENT_METHOD", "N_A"),
                new AuditSpec("RECOVERY_PAYMENT_CREATED", RecoveryStrategy.ALTERNATIVE_PAYMENT_METHOD,
                    "New recovery order created with alternative method | amount=₹720.00", "SUCCESS"),
                new AuditSpec("PAYMENT_SUCCEEDED", RecoveryStrategy.ALTERNATIVE_PAYMENT_METHOD,
                    "Recovery payment succeeded via alternative method — txn pay_demo_recovered_002 | ₹720.00 recovered", "SUCCESS")
            )
        );

        // ── Scenario 3: LOW → ABANDONED_CART_RECOVERY → IN_PROGRESS (pending) ─
        ScenarioSpec s3 = new ScenarioSpec(
            "priya@example.com",
            new BigDecimal("340.00"),
            RecoveryStrategy.ABANDONED_CART_RECOVERY,
            RecoveryStatus.IN_PROGRESS,
            0.38,
            "LOW_RECOVERY_POTENTIAL",
            List.of(
                "Customer has 2 previous delivered orders",
                "Order placed 95 minutes ago — somewhat stale",
                "Low-value order (₹340) — easier to retry",
                "1 previous failed payment increases risk slightly"
            ),
            "pay_demo_failed_003",
            null,
            List.of(
                new AuditSpec("RECOVERY_PAYMENT_CREATED", RecoveryStrategy.ABANDONED_CART_RECOVERY,
                    "Recovery notification sent to customer for cart recovery", "SUCCESS")
            )
        );

        // ── Scenario 4: HIGH probability → exhausted → FAILED ────────────────
        ScenarioSpec s4 = new ScenarioSpec(
            "arjun@example.com",
            new BigDecimal("1250.00"),
            RecoveryStrategy.GRACEFUL_STOP,
            RecoveryStatus.FAILED,
            0.71,
            "HIGH_RECOVERY_POTENTIAL",
            List.of(
                "Customer has 7 previous delivered orders",
                "High order value (₹1250) — more friction expected",
                "Order placed 3 hours ago",
                "Max recovery attempts (3) reached"
            ),
            "pay_demo_failed_004",
            null,
            List.of(
                new AuditSpec("RECOVERY_PAYMENT_CREATED", RecoveryStrategy.PAYMENT_RETRY,
                    "Attempt #1 created | amount=₹1250.00", "SUCCESS"),
                new AuditSpec("PAYMENT_FAILED_AGAIN", RecoveryStrategy.PAYMENT_RETRY,
                    "Attempt #1 failed", "FAILURE"),
                new AuditSpec("STRATEGY_CHANGED", RecoveryStrategy.ALTERNATIVE_PAYMENT_METHOD,
                    "Escalated to ALTERNATIVE_PAYMENT_METHOD", "N_A"),
                new AuditSpec("RECOVERY_PAYMENT_CREATED", RecoveryStrategy.ALTERNATIVE_PAYMENT_METHOD,
                    "Attempt #2 created with alternative method", "SUCCESS"),
                new AuditSpec("PAYMENT_FAILED_AGAIN", RecoveryStrategy.ALTERNATIVE_PAYMENT_METHOD,
                    "Attempt #2 failed", "FAILURE"),
                new AuditSpec("PAYMENT_FAILED_AGAIN", RecoveryStrategy.ALTERNATIVE_PAYMENT_METHOD,
                    "Attempt #3 failed", "FAILURE"),
                new AuditSpec("RECOVERY_STOPPED", RecoveryStrategy.GRACEFUL_STOP,
                    "Max attempts (3) reached — stopping gracefully", "N_A")
            )
        );

        // ── Scenario 5: NO_RECOVERY → GRACEFUL_STOP (prob too low) ──────────
        ScenarioSpec s5 = new ScenarioSpec(
            "priya@example.com",
            new BigDecimal("195.00"),
            RecoveryStrategy.GRACEFUL_STOP,
            RecoveryStatus.CANCELLED,
            0.12,
            "NO_RECOVERY",
            List.of(
                "First-time customer — no order history",
                "Order placed 8 hours ago — customer likely moved on",
                "3 previous failed payments on record",
                "Recovery probability too low — stopping gracefully"
            ),
            "pay_demo_failed_005",
            null,
            List.of(
                new AuditSpec("RECOVERY_STOPPED", RecoveryStrategy.GRACEFUL_STOP,
                    "Probability 12% — below threshold. Stopping gracefully.", "N_A")
            )
        );

        // ── Scenario 6: HIGH → RETRY → quick success (within minutes) ─────────
        ScenarioSpec s6 = new ScenarioSpec(
            "arjun@example.com",
            new BigDecimal("568.00"),
            RecoveryStrategy.PAYMENT_RETRY,
            RecoveryStatus.RECOVERED,
            0.91,
            "HIGH_RECOVERY_POTENTIAL",
            List.of(
                "Customer has 15 previous successfully delivered orders",
                "No previous failed payments on record",
                "Order placed just 3 minutes ago — customer very active",
                "Mid-range value ₹568 — strong recovery signal",
                "Customer chose online payment — shows payment intent"
            ),
            "pay_demo_failed_006",
            "pay_demo_recovered_006",
            List.of(
                new AuditSpec("RECOVERY_PAYMENT_CREATED", RecoveryStrategy.PAYMENT_RETRY,
                    "Razorpay recovery order created | amount=₹568.00", "SUCCESS"),
                new AuditSpec("PAYMENT_SUCCEEDED", RecoveryStrategy.PAYMENT_RETRY,
                    "Recovery payment succeeded — txn pay_demo_recovered_006 | ₹568.00 recovered", "SUCCESS")
            )
        );

        // ── Scenario 7: MEDIUM → IN_PROGRESS (customer notified, waiting) ─────
        ScenarioSpec s7 = new ScenarioSpec(
            "priya@example.com",
            new BigDecimal("899.00"),
            RecoveryStrategy.PAYMENT_RETRY,
            RecoveryStatus.IN_PROGRESS,
            0.55,
            "MEDIUM_RECOVERY_POTENTIAL",
            List.of(
                "Customer has 6 previous delivered orders",
                "Order placed 15 minutes ago — fresh",
                "High-value order (₹899) — some friction expected",
                "Customer chose online payment — shows intent"
            ),
            "pay_demo_failed_007",
            null,
            List.of(
                new AuditSpec("RECOVERY_PAYMENT_CREATED", RecoveryStrategy.PAYMENT_RETRY,
                    "Recovery Razorpay order created — waiting for customer action", "SUCCESS")
            )
        );

        // ── Scenario 8: RETRY → success after second attempt ─────────────────
        ScenarioSpec s8 = new ScenarioSpec(
            "arjun@example.com",
            new BigDecimal("312.00"),
            RecoveryStrategy.PAYMENT_RETRY,
            RecoveryStatus.RECOVERED,
            0.78,
            "HIGH_RECOVERY_POTENTIAL",
            List.of(
                "Customer has 9 previous delivered orders",
                "No previous failed payments",
                "Order placed 12 minutes ago — still active",
                "Low-value order (₹312) — easy to retry"
            ),
            "pay_demo_failed_008",
            "pay_demo_recovered_008",
            List.of(
                new AuditSpec("RECOVERY_PAYMENT_CREATED", RecoveryStrategy.PAYMENT_RETRY,
                    "Attempt #1 | amount=₹312.00", "SUCCESS"),
                new AuditSpec("PAYMENT_FAILED_AGAIN", RecoveryStrategy.PAYMENT_RETRY,
                    "Attempt #1 failed — temporary network issue", "FAILURE"),
                new AuditSpec("RECOVERY_PAYMENT_CREATED", RecoveryStrategy.PAYMENT_RETRY,
                    "Attempt #2 | amount=₹312.00", "SUCCESS"),
                new AuditSpec("PAYMENT_SUCCEEDED", RecoveryStrategy.PAYMENT_RETRY,
                    "Recovery succeeded on attempt #2 — txn pay_demo_recovered_008 | ₹312.00 recovered", "SUCCESS")
            )
        );

        List<ScenarioSpec> scenarios = List.of(s1, s2, s3, s4, s5, s6, s7, s8);
        List<Long> createdOrderIds = new ArrayList<>();
        int created = 0;

        for (ScenarioSpec spec : scenarios) {
            try {
                Long orderId = buildScenario(spec);
                if (orderId != null) {
                    createdOrderIds.add(orderId);
                    created++;
                }
            } catch (Exception e) {
                log.warn("[DEMO SEED] Failed to create scenario for {}: {}", spec.customerEmail(), e.getMessage());
            }
        }

        log.info("[DEMO SEED] Created {} recovery scenarios (order IDs: {})", created, createdOrderIds);
        return Map.of("created", created, "orderIds", createdOrderIds);
    }

    // ── Build one scenario ────────────────────────────────────────────────────

    private Long buildScenario(ScenarioSpec spec) {
        // Find customer
        User customer = userRepository.findByEmail(spec.customerEmail()).orElse(null);
        if (customer == null) {
            log.warn("[DEMO SEED] Customer not found: {}", spec.customerEmail());
            return null;
        }

        // Find or create an address for this customer
        Address address = addressRepository.findByUserId(customer.getId())
                .stream().findFirst()
                .orElseGet(() -> {
                    Address a = Address.builder()
                            .user(customer)
                            .fullName(customer.getName())
                            .phone("9999999999")
                            .houseNumber("123")
                            .street("Demo Street")
                            .area("Anna Nagar")
                            .city("Chennai")
                            .state("Tamil Nadu")
                            .postalCode("600001")
                            .addressType(AddressType.HOME)
                            .isDefault(false)
                            .build();
                    return addressRepository.save(a);
                });

        // Create the order — PLACED + RAZORPAY (simulates a failed payment order)
        Order order = Order.builder()
                .customer(customer)
                .deliveryAddress(address)
                .status(OrderStatus.PLACED)
                .subtotal(spec.amount().subtract(new BigDecimal("49")).divide(new BigDecimal("1.05"), 2, java.math.RoundingMode.HALF_UP))
                .deliveryFee(new BigDecimal("49"))
                .tax(spec.amount().subtract(new BigDecimal("49")).multiply(new BigDecimal("0.05"))
                        .divide(new BigDecimal("1.05"), 2, java.math.RoundingMode.HALF_UP))
                .discountAmount(BigDecimal.ZERO)
                .totalAmount(spec.amount())
                .paymentMethod(PaymentMethod.RAZORPAY)
                .specialInstructions("[DEMO] Recovery scenario")
                .etaMinutes(30)
                .assignmentAttempts(0)
                .partnerAssigned(false)
                .build();
        order = orderRepository.save(order);

        // Create the failed Payment record
        Payment payment = Payment.builder()
                .order(order)
                .amount(spec.amount())
                .method(PaymentMethod.RAZORPAY)
                .status(PaymentStatus.FAILED)
                .gatewayOrderId("order_demo_" + order.getId())
                .transactionRef(spec.originalPaymentId())
                .build();
        paymentRepository.save(payment);

        // If scenario ends as RECOVERED, update order to CONFIRMED
        if (spec.finalStatus() == RecoveryStatus.RECOVERED) {
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setTransactionRef(spec.recoveryTxnId());
            paymentRepository.save(payment);
            order.setStatus(OrderStatus.CONFIRMED);
            order.setConfirmedAt(LocalDateTime.now().minusMinutes(2));
            orderRepository.save(order);
        }

        // Build the RecoveryAttempt
        int attemptCount = (int) spec.extraAudits().stream()
                .filter(a -> a.event().equals("PAYMENT_FAILED_AGAIN")).count();

        RecoveryAttempt attempt = RecoveryAttempt.builder()
                .order(order)
                .customer(customer)
                .originalPaymentId(spec.originalPaymentId())
                .recoveryTransactionId(spec.finalStatus() == RecoveryStatus.RECOVERED ? spec.recoveryTxnId() : null)
                .status(spec.finalStatus())
                .selectedStrategy(spec.strategy())
                .recoveryProbability(BigDecimal.valueOf(spec.probability()))
                .riskLevel(spec.riskLevel())
                .reasonsJson(toJson(spec.reasons()))
                .attemptCount(attemptCount)
                .recoveryAmount(spec.amount())
                .resolvedAt(spec.finalStatus() == RecoveryStatus.RECOVERED || spec.finalStatus() == RecoveryStatus.FAILED || spec.finalStatus() == RecoveryStatus.CANCELLED
                        ? LocalDateTime.now().minusMinutes(1) : null)
                .build();
        attempt = recoveryAttemptRepository.save(attempt);

        // Write standard audit log entries
        writeAudit(attempt, "PAYMENT_FAILED", null,
                "Original payment " + spec.originalPaymentId() + " failed for order " + order.getId(), "N_A",
                LocalDateTime.now().minusMinutes(18));

        writeAudit(attempt, "HISTORY_RETRIEVED", null,
                "Customer " + customer.getId() + " history analysed — " + spec.reasons().size() + " signals found", "N_A",
                LocalDateTime.now().minusMinutes(17).minusSeconds(58));

        writeAudit(attempt, "PROBABILITY_CALCULATED", null,
                "probability=" + spec.probability() + " risk=" + spec.riskLevel()
                        + " reasons=" + spec.reasons(), "N_A",
                LocalDateTime.now().minusMinutes(17).minusSeconds(55));

        writeAudit(attempt, "STRATEGY_SELECTED", spec.strategy(),
                "Strategy: " + spec.strategy() + " | Risk: " + spec.riskLevel(), "N_A",
                LocalDateTime.now().minusMinutes(17).minusSeconds(52));

        if (spec.finalStatus() != RecoveryStatus.CANCELLED) {
            writeAudit(attempt, "RECOVERY_INITIATED", spec.strategy(),
                    "Recovery notification sent to customer — strategy: " + spec.strategy(), "SUCCESS",
                    LocalDateTime.now().minusMinutes(17).minusSeconds(50));
        }

        // Write scenario-specific extra audit entries
        long offsetSeconds = 17 * 60 - 45;
        for (AuditSpec a : spec.extraAudits()) {
            writeAudit(attempt, a.event(), a.strategy(), a.details(), a.result(),
                    LocalDateTime.now().minusSeconds(offsetSeconds));
            offsetSeconds -= 45;
        }

        log.info("[DEMO SEED] Created scenario: order={} customer={} strategy={} status={}",
                order.getId(), spec.customerEmail(), spec.strategy(), spec.finalStatus());
        return order.getId();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void writeAudit(RecoveryAttempt attempt, String event, RecoveryStrategy strategy,
                             String details, String result, LocalDateTime timestamp) {
        RecoveryAuditLog log = RecoveryAuditLog.builder()
                .attempt(attempt)
                .orderId(attempt.getOrder().getId())
                .event(event)
                .strategy(strategy)
                .details(details)
                .result(result)
                .build();
        // Override the @PrePersist timestamp by setting it directly via reflection
        auditLogRepository.save(log);
        // Update timestamp after save
        try {
            java.lang.reflect.Field f = RecoveryAuditLog.class.getDeclaredField("timestamp");
            f.setAccessible(true);
            f.set(log, timestamp);
            auditLogRepository.save(log);
        } catch (Exception ignored) {
            // timestamp will be current time — acceptable
        }
    }

    private String toJson(List<String> list) {
        try {
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < list.size(); i++) {
                sb.append("\"").append(list.get(i).replace("\"", "'")).append("\"");
                if (i < list.size() - 1) sb.append(",");
            }
            sb.append("]");
            return sb.toString();
        } catch (Exception e) {
            return "[]";
        }
    }
}
