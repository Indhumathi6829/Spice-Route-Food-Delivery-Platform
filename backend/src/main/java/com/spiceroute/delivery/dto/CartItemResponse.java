package com.spiceroute.delivery.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CartItemResponse {
    private Long id;
    private Long foodItemId;
    private String foodItemName;
    private String imageUrl;
    private Boolean vegetarian;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
    private String customizations;
}
