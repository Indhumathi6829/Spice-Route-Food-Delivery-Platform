package com.spiceroute.delivery.dto;

import com.spiceroute.delivery.entity.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class FestivalOfferRequest {

    @NotBlank
    private String festivalName;

    @NotBlank
    private String title;

    private String description;

    private String bannerImage;

    @NotNull
    private DiscountType discountType;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal discountValue;

    private BigDecimal maximumDiscount;

    private BigDecimal minimumOrderValue;

    private String couponCode;

    @NotNull
    private LocalDateTime startDate;

    @NotNull
    private LocalDateTime endDate;

    private String applicableCategories;

    private String applicableRestaurants;

    private Boolean active;
}
