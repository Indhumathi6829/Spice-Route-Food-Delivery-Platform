package com.spiceroute.delivery.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "festival_offers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FestivalOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String festivalName;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** URL to the banner image */
    private String bannerImage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DiscountType discountType = DiscountType.PERCENTAGE;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    @Column(precision = 10, scale = 2)
    private BigDecimal maximumDiscount;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal minimumOrderValue = BigDecimal.ZERO;

    /** The coupon code customers use at checkout */
    @Column(unique = true)
    private String couponCode;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    /** Comma-separated category names this offer applies to; null = all */
    @Column(columnDefinition = "TEXT")
    private String applicableCategories;

    /** Comma-separated restaurant identifiers; null = all */
    @Column(columnDefinition = "TEXT")
    private String applicableRestaurants;

    @Builder.Default
    private Boolean active = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist  protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate   protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    /** Derived: is this offer currently live? */
    public boolean isCurrentlyActive() {
        LocalDateTime now = LocalDateTime.now();
        return Boolean.TRUE.equals(active)
                && startDate != null && endDate != null
                && !now.isBefore(startDate)
                && !now.isAfter(endDate);
    }
}
