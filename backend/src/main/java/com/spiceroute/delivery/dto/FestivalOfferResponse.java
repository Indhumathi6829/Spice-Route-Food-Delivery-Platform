package com.spiceroute.delivery.dto;

import com.spiceroute.delivery.entity.DiscountType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class FestivalOfferResponse {
    private Long id;
    private String festivalName;
    private String title;
    private String description;
    private String bannerImage;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal maximumDiscount;
    private BigDecimal minimumOrderValue;
    private String couponCode;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String applicableCategories;
    private String applicableRestaurants;
    private Boolean active;
    private boolean currentlyActive;
    private String status;           // "UPCOMING" | "ACTIVE" | "EXPIRED"
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
