package com.spiceroute.delivery.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Extended profile for users with DELIVERY_PARTNER role.
 * One-to-one with User entity — do NOT duplicate user fields here.
 */
@Entity
@Table(name = "delivery_partners", indexes = {
    @Index(name = "idx_dp_user",      columnList = "user_id",     unique = true),
    @Index(name = "idx_dp_available", columnList = "is_online, is_available"),
    @Index(name = "idx_dp_location",  columnList = "current_latitude, current_longitude")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeliveryPartner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String vehicleType;       // BIKE, SCOOTER, BICYCLE, CAR

    private String vehicleNumber;

    private String licenseNumber;

    @Column(precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal rating = BigDecimal.valueOf(5.0);

    private Integer totalRatings = 0;

    @Builder.Default
    private Boolean isOnline = false;

    @Builder.Default
    private Boolean isAvailable = true;

    @Column(name = "current_latitude")
    private Double currentLatitude;

    @Column(name = "current_longitude")
    private Double currentLongitude;

    private LocalDateTime lastLocationUpdate;

    @Builder.Default
    private Integer totalDeliveries = 0;

    @Builder.Default
    private Integer todayDeliveries = 0;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist  protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate   protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
