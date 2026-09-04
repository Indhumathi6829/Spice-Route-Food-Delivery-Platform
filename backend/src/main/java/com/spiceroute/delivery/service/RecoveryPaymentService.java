package com.spiceroute.delivery.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.spiceroute.delivery.entity.*;
import com.spiceroute.delivery.exception.BusinessException;
import com.spiceroute.delivery.exception.ResourceNotFoundException;
import com.spiceroute.delivery.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Map;

/**
 * Handles Razorpay payment creation and verification for the RECOVERY flow.
 *
 * FINANCIAL SAFETY RULES (enforced here, not by the LLM):
 *  1. Amount is ALWAYS read from order.totalAmount in the database.
 *  2. The LLM / AI agent NEVER touches amounts.
 *  3. Duplicate recovery payments are blocked (idempotency guard).
 *  4. A COMPLETED or already-RECOVERED order cannot be charged again.
 *  5. Signature is verified server-side before marking anything as recovered.
 *
 * Reuses the existing Razorpay key configuration — no second integration.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RecoveryPaymentService {

    @Value("${app.razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${app.razorpay.key-secret}")
    private String razorpayKeySecret;

    private final RecoveryAttemptRepository  recoveryAttemptRepository;
    private final RecoveryAuditLogRepository auditLogRepository;
    private final OrderRepository            orderRepository;
    private final PaymentRepository          paymentRepository;
    private final AiRecoveryAgentService     agentService;
    private final NotificationService        notificationService;
    private final SimpMessagingTemplate      messagingTemplate;

    // ── Create recovery Razorpay order ───────────────────────────────────────

    /**
     * Called by RecoveryController when the customer clicks "Retry Payment".
     * Creates a fresh Razorpay order for the recovery attempt.
     *
     * Returns the same shape as the normal /api/payments/create endpoint so
     * the existing frontend Razorpay checkout widget can be reused.
     */
    @Transactional
    public Map<String, Object> createRecoveryRazorpayOrder(Long orderId, Long customerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        // Security: only the order's customer can initiate recovery
        if (!order.getCustomer().getId().equals(customerId)) {
            throw new BusinessException("Not authorised to recover this order");
        }

        // Guard: don't allow recovery if already paid
        Payment existingPayment = paymentRepository.findByOrderId(orderId).orElse(null);
        if (existingPayment != null && existingPayment.getStatus() == PaymentStatus.COMPLETED) {
            throw new BusinessException("Order " + orderId + " is already paid — no recovery needed");
        }

        // Guard: must have an active recovery attempt
        RecoveryAttempt attempt = recoveryAttemptRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("RecoveryAttempt for order", orderId));

        if (attempt.getStatus() == RecoveryStatus.RECOVERED) {
            throw new BusinessException("Order already recovered");
        }
        if (attempt.getStatus() == RecoveryStatus.EXPIRED
                || attempt.getStatus() == RecoveryStatus.CANCELLED) {
            throw new BusinessException("Recovery window has closed for this order");
        }

        // Amount always from DB — never from frontend or LLM
        BigDecimal amount = order.getTotalAmount();
        long amountPaise  = amount.multiply(BigDecimal.valueOf(100)).longValue();

        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject options = new JSONObject();
            options.put("amount", amountPaise);
            options.put("currency", "INR");
            options.put("receipt", "recovery_" + orderId + "_" + attempt.getAttemptCount());

            com.razorpay.Order rzpOrder = client.orders.create(options);
            String gatewayOrderId = rzpOrder.get("id");

            // Store the recovery gateway order id
            attempt.setRecoveryGatewayOrderId(gatewayOrderId);
            attempt.setAttemptCount(attempt.getAttemptCount() + 1);
            recoveryAttemptRepository.save(attempt);

            audit(attempt, "RECOVERY_PAYMENT_CREATED", attempt.getSelectedStrategy(),
                    "Razorpay recovery order " + gatewayOrderId + " created | amount=₹" + amount, "SUCCESS");

            log.info("[RECOVERY] Razorpay recovery order created: {} for order {} amount ₹{}",
                    gatewayOrderId, orderId, amount);

            return Map.of(
                    "razorpayOrderId", gatewayOrderId,
                    "amount",          amountPaise,
                    "currency",        "INR",
                    "keyId",           razorpayKeyId,
                    "orderId",         orderId,
                    "recoveryAttemptId", attempt.getId()
            );
        } catch (RazorpayException e) {
            log.error("[RECOVERY] Razorpay order creation failed for order {}", orderId, e);
            throw new BusinessException("Payment gateway error: " + e.getMessage());
        }
    }

    // ── Verify recovery payment ──────────────────────────────────────────────

    /**
     * Server-side signature verification for a recovery payment.
     * NEVER trust frontend-only success. Always verify here.
     *
     * On success  → marks payment COMPLETED, order CONFIRMED, attempt RECOVERED.
     * On failure  → escalates strategy via agent, returns failure info.
     */
    @Transactional
    public Map<String, Object> verifyRecoveryPayment(
            String rzpOrderId, String rzpPaymentId, String rzpSignature, Long customerId) {

        // Find the recovery attempt by the recovery gateway order id
        RecoveryAttempt attempt = recoveryAttemptRepository
                .findByRecoveryGatewayOrderId(rzpOrderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "RecoveryAttempt for gateway order", 0L));

        Order order = attempt.getOrder();

        // Security check
        if (!order.getCustomer().getId().equals(customerId)) {
            throw new BusinessException("Not authorised to verify this recovery payment");
        }

        // Idempotency — already recovered
        if (attempt.getStatus() == RecoveryStatus.RECOVERED) {
            return Map.of("status", "SUCCESS",
                    "transactionId", attempt.getRecoveryTransactionId(),
                    "message", "Already recovered");
        }

        // Signature verification — server-side, never skip
        String expectedSig = computeSignature(rzpOrderId + "|" + rzpPaymentId, razorpayKeySecret);
        if (!expectedSig.equals(rzpSignature)) {
            audit(attempt, "SIGNATURE_VERIFICATION_FAILED", attempt.getSelectedStrategy(),
                    "Signature mismatch for payment " + rzpPaymentId, "FAILURE");
            agentService.markRetryFailed(attempt.getId());
            throw new BusinessException("Payment signature verification failed");
        }

        // ── SUCCESS path ──────────────────────────────────────────────────────
        // Update or create the Payment record
        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElse(Payment.builder()
                        .order(order)
                        .amount(order.getTotalAmount())
                        .method(order.getPaymentMethod())
                        .build());
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setGatewayOrderId(rzpOrderId);
        payment.setTransactionRef(rzpPaymentId);
        payment.setSignature(rzpSignature);
        paymentRepository.save(payment);

        // Advance order to CONFIRMED
        if (order.getStatus() == OrderStatus.PLACED) {
            order.setStatus(OrderStatus.CONFIRMED);
            order.setConfirmedAt(LocalDateTime.now());
            OrderStatusHistory hist = OrderStatusHistory.builder()
                    .order(order).status(OrderStatus.CONFIRMED)
                    .note("Payment confirmed via recovery — txn " + rzpPaymentId)
                    .build();
            order.getStatusHistory().add(hist);
            orderRepository.save(order);

            // Broadcast to WebSocket so tracking page updates
            messagingTemplate.convertAndSend("/topic/orders/" + order.getId(),
                    Map.of("orderId", order.getId(), "status", "CONFIRMED",
                            "etaMinutes", order.getEtaMinutes() != null ? order.getEtaMinutes() : 0));
            messagingTemplate.convertAndSend("/topic/restaurant/orders",
                    Map.of("orderId", order.getId(), "status", "CONFIRMED", "recovered", true));
        }

        // Mark recovery attempt as recovered
        agentService.markRecovered(attempt.getId(), rzpPaymentId);

        // Notify customer
        notificationService.send(order.getCustomer().getId(),
                "Payment Recovered ✅",
                "Your order #" + order.getId() + " payment of ₹" + order.getTotalAmount()
                        + " was successfully recovered!",
                NotificationType.PAYMENT_UPDATE, order.getId());

        log.info("[RECOVERY] Payment verified and recovered: order={} txn={} amount=₹{}",
                order.getId(), rzpPaymentId, order.getTotalAmount());

        return Map.of(
                "status",        "SUCCESS",
                "transactionId", rzpPaymentId,
                "orderId",       order.getId(),
                "message",       "Payment recovered successfully — ₹" + order.getTotalAmount()
        );
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Entry point called by the payment failure hook in PaymentService.
     * Triggers the AI agent asynchronously — never blocks the existing flow.
     */
    @Transactional
    public void onPaymentFailed(Long orderId, String failedPaymentId) {
        onPaymentFailed(orderId, failedPaymentId, null, null);
    }

    @Transactional
    public void onPaymentFailed(Long orderId, String failedPaymentId,
                                 String failureReason, String failureCode) {
        try {
            agentService.triggerRecovery(orderId, failedPaymentId, failureReason, failureCode);
        } catch (Exception e) {
            log.error("[RECOVERY] Agent trigger failed for order {} — app continues normally: {}",
                    orderId, e.getMessage());
        }
    }

    private String computeSignature(String payload, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new BusinessException("Signature computation failed");
        }
    }

    private void audit(RecoveryAttempt attempt, String event,
                       RecoveryStrategy strategy, String details, String result) {
        try {
            auditLogRepository.save(RecoveryAuditLog.builder()
                    .attempt(attempt)
                    .orderId(attempt.getOrder().getId())
                    .event(event)
                    .strategy(strategy)
                    .details(details)
                    .result(result)
                    .build());
        } catch (Exception e) {
            log.error("[RECOVERY] Audit write failed: {}", e.getMessage());
        }
    }
}
