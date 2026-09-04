package com.spiceroute.delivery.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.spiceroute.delivery.entity.*;
import com.spiceroute.delivery.exception.BusinessException;
import com.spiceroute.delivery.exception.ResourceNotFoundException;
import com.spiceroute.delivery.repository.OrderRepository;
import com.spiceroute.delivery.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    @Value("${app.razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${app.razorpay.key-secret}")
    private String razorpayKeySecret;

    private final PaymentRepository    paymentRepository;
    private final OrderRepository      orderRepository;
    private final NotificationService  notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    // Setter injection to break circular dependency with OrderService
    private DeliveryAssignmentService deliveryAssignmentService;

    @Autowired
    public void setDeliveryAssignmentService(DeliveryAssignmentService deliveryAssignmentService) {
        this.deliveryAssignmentService = deliveryAssignmentService;
    }

    // ── AI Recovery hook (setter-injected to avoid circular dependency) ──────
    // RecoveryPaymentService depends on OrderRepository/PaymentRepository which
    // PaymentService also uses, so we use ApplicationContext lazy lookup instead
    // of constructor injection to keep the existing bean graph untouched.
    @Autowired
    private ApplicationContext applicationContext;

    private void notifyRecoveryAgent(Long orderId, String paymentId) {
        try {
            com.spiceroute.delivery.service.RecoveryPaymentService recoveryService =
                    applicationContext.getBean(
                            com.spiceroute.delivery.service.RecoveryPaymentService.class);
            recoveryService.onPaymentFailed(orderId, paymentId, "Payment signature verification failed", "SIGNATURE_ERROR");
        } catch (Exception e) {
            log.warn("[RECOVERY HOOK] Could not trigger recovery for order {}: {}",
                    orderId, e.getMessage());
        }
    }

    /** Create a Razorpay order and record a pending payment. */
    @Transactional
    public Map<String, Object> createRazorpayOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (order.getPaymentMethod() == PaymentMethod.CASH_ON_DELIVERY) {
            throw new BusinessException("This order uses Cash on Delivery – no online payment needed");
        }

        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject options = new JSONObject();
            // Razorpay expects amount in paise
            long amountPaise = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();
            options.put("amount", amountPaise);
            options.put("currency", "INR");
            options.put("receipt", "order_" + orderId);

            com.razorpay.Order rzpOrder = client.orders.create(options);
            String gatewayOrderId = rzpOrder.get("id");

            // Persist payment record
            Payment payment = paymentRepository.findByOrderId(orderId)
                    .orElse(Payment.builder().order(order).amount(order.getTotalAmount())
                            .method(order.getPaymentMethod()).build());
            payment.setGatewayOrderId(gatewayOrderId);
            payment.setStatus(PaymentStatus.PENDING);
            paymentRepository.save(payment);

            return Map.of(
                    "razorpayOrderId", gatewayOrderId,
                    "amount", amountPaise,
                    "currency", "INR",
                    "keyId", razorpayKeyId,
                    "orderId", orderId
            );
        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed", e);
            throw new BusinessException("Payment gateway error: " + e.getMessage());
        }
    }

    /** Verify Razorpay signature – never trust frontend success alone.
     *
     * After verification:
     *  1. Payment is marked COMPLETED.
     *  2. Order status advances to CONFIRMED (fires status WebSocket broadcast).
     *  3. Delivery assignment process is started asynchronously.
     */
    @Transactional
    public Map<String, String> verifyPayment(String rzpOrderId, String rzpPaymentId, String rzpSignature) {
        Payment payment = paymentRepository.findByGatewayOrderId(rzpOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for gateway order: " + rzpOrderId));

        // ── Idempotency guard — don't double-process ──────────────────────────
        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            log.warn("Duplicate payment callback ignored for gateway order {}", rzpOrderId);
            return Map.of("status", "SUCCESS", "transactionId", payment.getTransactionRef());
        }

        // ── Signature verification ────────────────────────────────────────────
        String expectedSig = computeSignature(rzpOrderId + "|" + rzpPaymentId, razorpayKeySecret);
        if (!expectedSig.equals(rzpSignature)) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            // ── AI Recovery hook (additive — never throws) ────────────────────
            notifyRecoveryAgent(payment.getOrder().getId(), rzpPaymentId);
            throw new BusinessException("Payment signature verification failed");
        }

        // ── Mark payment complete ─────────────────────────────────────────────
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setTransactionRef(rzpPaymentId);
        payment.setSignature(rzpSignature);
        paymentRepository.save(payment);

        // ── Advance order status to CONFIRMED ─────────────────────────────────
        Order order = payment.getOrder();
        order.setStatus(OrderStatus.CONFIRMED);
        order.setConfirmedAt(LocalDateTime.now());

        OrderStatusHistory hist = OrderStatusHistory.builder()
                .order(order)
                .status(OrderStatus.CONFIRMED)
                .note("Payment confirmed via Razorpay — txn " + rzpPaymentId)
                .build();
        order.getStatusHistory().add(hist);
        orderRepository.save(order);

        // Broadcast status change over WebSocket so tracking page updates immediately
        messagingTemplate.convertAndSend("/topic/orders/" + order.getId(),
                Map.of("orderId", order.getId(), "status", "CONFIRMED",
                       "etaMinutes", order.getEtaMinutes() != null ? order.getEtaMinutes() : 0));
        messagingTemplate.convertAndSend("/topic/restaurant/orders",
                Map.of("orderId", order.getId(), "status", "CONFIRMED"));

        // ── Notify customer ───────────────────────────────────────────────────
        notificationService.send(order.getCustomer().getId(),
                "Payment Successful ✅",
                "Payment of ₹" + order.getTotalAmount() + " confirmed. Your order is being prepared!",
                NotificationType.PAYMENT_UPDATE, order.getId());

        log.info("Payment verified for order {} | txn {} | order status → CONFIRMED",
                order.getId(), rzpPaymentId);

        // ── Start delivery assignment asynchronously ───────────────────────────
        // Assignment runs via @Async so it doesn't block the HTTP response.
        // It will wait for the restaurant to mark the order READY_FOR_PICKUP
        // before actually assigning — the scheduler in DeliveryAssignmentService
        // handles the READY_FOR_PICKUP trigger too, so this is belt-and-suspenders.
        if (deliveryAssignmentService != null) {
            log.info("Scheduling delivery assignment for order {} after payment", order.getId());
            // We don't assign immediately here — assignment starts when restaurant
            // marks READY_FOR_PICKUP (handled in OrderService.triggerDeliveryAssignmentIfReady).
            // What we do here is just broadcast the confirmation so the admin/restaurant
            // sees the new paid order immediately.
            messagingTemplate.convertAndSend("/topic/restaurant/orders",
                    Map.of("orderId", order.getId(), "status", "CONFIRMED", "paid", true));
        }

        return Map.of("status", "SUCCESS", "transactionId", rzpPaymentId);
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
}
