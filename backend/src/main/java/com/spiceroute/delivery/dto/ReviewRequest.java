package com.spiceroute.delivery.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotNull private Long orderId;
    @NotNull @Min(1) @Max(5) private Integer foodRating;
    @Min(1) @Max(5) private Integer deliveryRating;
    @Size(max = 1000) private String comment;
}
