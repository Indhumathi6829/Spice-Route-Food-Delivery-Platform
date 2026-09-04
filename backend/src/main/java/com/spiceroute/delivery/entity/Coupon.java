package com.spiceroute.delivery.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons", indexes = {
    @Index(name = "idx_coupon_code", columnList = "code", unique = true)
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal discountValue;

    @Column(precision = 8, scale = 2)
    private BigDecimal minimumOrderValue;

    @Column(precision = 8, scale = 2)
    private BigDecimal maximumDiscount;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    private Integer usageLimit;

    @Builder.Default
    private Integer usageCount = 0;

    @Builder.Default
    private Boolean active = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }

    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return active
                && now.isAfter(startDate)
                && now.isBefore(expiryDate)
                && (usageLimit == null || usageCount < usageLimit);
    }

    public BigDecimal calculateDiscount(BigDecimal orderAmount) {
        if (discountType == DiscountType.PERCENTAGE) {
            BigDecimal disc = orderAmount.multiply(discountValue).divide(BigDecimal.valueOf(100));
            return maximumDiscount != null ? disc.min(maximumDiscount) : disc;
        } else {
            return discountValue.min(orderAmount);
        }
    }
}
