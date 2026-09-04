package com.spiceroute.delivery.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Time-series GPS snapshots from delivery partners.
 * Used for live tracking; only retain last N hours (purge via scheduled job).
 */
@Entity
@Table(name = "delivery_locations", indexes = {
    @Index(name = "idx_dloc_partner", columnList = "partner_id"),
    @Index(name = "idx_dloc_order",   columnList = "order_id"),
    @Index(name = "idx_dloc_ts",      columnList = "recorded_at")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeliveryLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id", nullable = false)
    private DeliveryPartner partner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;          // nullable — also tracks idle locations

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private Float speedKmh;

    private Float headingDegrees;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @PrePersist protected void onCreate() { if (recordedAt == null) recordedAt = LocalDateTime.now(); }
}
