package com.spiceroute.delivery.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private Long orderId;
    private Long customerId;
    private String customerName;
    private String customerProfileImage;
    private Integer foodRating;
    private Integer deliveryRating;
    private String deliveryPartnerName;
    private String comment;
    private Boolean approved;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
