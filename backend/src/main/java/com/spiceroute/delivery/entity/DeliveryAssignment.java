package com.spiceroute.delivery.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Tracks each attempt to assign a delivery partner to an order.
 * Multiple rows may exist per order (one per attempt — accept/reject chain).
 */
@Entity
@Table(name = "delivery_assignments", indexes = {
    @Index(name = "idx_da_order",   columnList = "order_id"),
    @Index(name = "idx_da_partner", columnList = "partner_id"),
    @Index(name = "idx_da_status",  columnList = "status")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeliveryAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id", nullable = false)
    private DeliveryPartner partner;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AssignmentStatus status = AssignmentStatus.PENDING;

    /** Distance in km from partner to restaurant at time of assignment */
    private Double distanceKm;

    /** Score used to rank this partner */
    private Double score;

    /** How many seconds partner has to respond */
    @Builder.Default
    private Integer timeoutSeconds = 60;

    private LocalDateTime offeredAt;
    private LocalDateTime respondedAt;
    private LocalDateTime pickedUpAt;
    private LocalDateTime deliveredAt;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist protected void onCreate() {
        createdAt = LocalDateTime.now();
        offeredAt = LocalDateTime.now();
    }
}
