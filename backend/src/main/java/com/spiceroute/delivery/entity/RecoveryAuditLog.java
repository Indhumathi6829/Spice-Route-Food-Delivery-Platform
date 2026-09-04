package com.spiceroute.delivery.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Immutable audit trail — one row per AI decision/action during a recovery
 * attempt. Never updated, only appended.
 */
@Entity
@Table(name = "recovery_audit_logs", indexes = {
    @Index(name = "idx_audit_attempt", columnList = "attempt_id"),
    @Index(name = "idx_audit_order",   columnList = "order_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RecoveryAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private RecoveryAttempt attempt;

    /** Denormalised for easy querying without joining */
    @Column(name = "order_id", nullable = false)
    private Long orderId;

    /**
     * What happened: PAYMENT_FAILED, AGENT_TRIGGERED, HISTORY_RETRIEVED,
     * PROBABILITY_CALCULATED, STRATEGY_SELECTED, RECOVERY_INITIATED,
     * PAYMENT_SUCCEEDED, PAYMENT_FAILED_AGAIN, STRATEGY_CHANGED,
     * RECOVERY_STOPPED, EXPIRED, etc.
     */
    @Column(nullable = false, length = 64)
    private String event;

    @Enumerated(EnumType.STRING)
    private RecoveryStrategy strategy;

    /** Serialised details (JSON string kept simple, no extra dependency needed) */
    @Column(columnDefinition = "TEXT")
    private String details;

    /** Result of the action: SUCCESS / FAILURE / PENDING / N_A */
    @Column(length = 32)
    private String result;

    @Column(updatable = false, nullable = false)
    private LocalDateTime timestamp;

    @PrePersist protected void onCreate() { timestamp = LocalDateTime.now(); }
}
