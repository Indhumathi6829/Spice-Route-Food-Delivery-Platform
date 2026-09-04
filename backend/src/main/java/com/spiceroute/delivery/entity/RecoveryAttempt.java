package com.spiceroute.delivery.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * One recovery attempt per order. Tracks the overall AI recovery lifecycle
 * for a single failed/abandoned payment. Multiple AuditLog entries are
 * attached to each attempt to record every individual action.
 */
@Entity
@Table(name = "recovery_attempts", indexes = {
    @Index(name = "idx_recovery_order",    columnList = "order_id"),
    @Index(name = "idx_recovery_customer", columnList = "customer_id"),
    @Index(name = "idx_recovery_status",   columnList = "status")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RecoveryAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    /** Original Razorpay payment_id that failed (null for abandoned cart) */
    private String originalPaymentId;

    /** Human-readable failure reason captured from Razorpay error (e.g. "Insufficient funds") */
    private String failureReason;

    /** Failure code from Razorpay (e.g. BAD_REQUEST_ERROR, GATEWAY_ERROR) */
    private String failureCode;

    /** Razorpay order_id created for the recovery payment */
    private String recoveryGatewayOrderId;

    /** Razorpay payment_id after successful recovery */
    private String recoveryTransactionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RecoveryStatus status = RecoveryStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private RecoveryStrategy selectedStrategy;

    /** AI-calculated probability (0.0 – 1.0) */
    @Column(precision = 5, scale = 4)
    private BigDecimal recoveryProbability;

    /** Human-readable risk level label from the engine */
    private String riskLevel;

    /** JSON array of reasons the AI chose this strategy */
    @Column(columnDefinition = "TEXT")
    private String reasonsJson;

    /** Number of retry attempts made so far */
    @Builder.Default
    private Integer attemptCount = 0;

    /** Amount to be recovered (always from trusted DB, never from frontend) */
    @Column(precision = 10, scale = 2)
    private BigDecimal recoveryAmount;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    @PrePersist  protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate   protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
