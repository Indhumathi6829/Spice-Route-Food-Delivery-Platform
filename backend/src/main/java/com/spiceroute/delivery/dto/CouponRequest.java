package com.spiceroute.delivery.dto;

import com.spiceroute.delivery.entity.DiscountType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CouponRequest {
    @NotBlank private String code;
    private String description;
    @NotNull private DiscountType discountType;
    @NotNull @DecimalMin("0.01") private BigDecimal discountValue;
    @DecimalMin("0.0") private BigDecimal minimumOrderValue;
    @DecimalMin("0.0") private BigDecimal maximumDiscount;
    @NotNull private LocalDateTime startDate;
    @NotNull private LocalDateTime expiryDate;
    private Integer usageLimit;
    private Boolean active = true;
}
