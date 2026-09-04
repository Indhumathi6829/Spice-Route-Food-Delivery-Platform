package com.spiceroute.delivery.dto;

import com.spiceroute.delivery.entity.SpicyLevel;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class FoodItemResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private BigDecimal effectivePrice;
    private String imageUrl;
    private Boolean vegetarian;
    private SpicyLevel spicyLevel;
    private Integer preparationTime;
    private Integer calories;
    private BigDecimal rating;
    private Integer totalRatings;
    private Boolean available;
    private Boolean bestseller;
    private String ingredients;
    private Boolean isFavorite;
    private LocalDateTime createdAt;
}
