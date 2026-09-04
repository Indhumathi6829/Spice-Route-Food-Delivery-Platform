package com.spiceroute.delivery.dto;

import com.spiceroute.delivery.entity.SpicyLevel;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class FoodItemRequest {
    @NotNull private Long categoryId;
    @NotBlank private String name;
    private String description;
    @NotNull @DecimalMin("0.0") private BigDecimal price;
    @DecimalMin("0.0") private BigDecimal discountPrice;
    private String imageUrl;
    private Boolean vegetarian = true;
    private SpicyLevel spicyLevel = SpicyLevel.MILD;
    private Integer preparationTime;
    private Integer calories;
    private Boolean available = true;
    private Boolean bestseller = false;
    private String ingredients;
}
