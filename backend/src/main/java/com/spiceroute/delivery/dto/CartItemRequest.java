package com.spiceroute.delivery.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CartItemRequest {
    @NotNull private Long foodItemId;
    @Min(1) @Max(20) private Integer quantity = 1;
    private String customizations;
}
