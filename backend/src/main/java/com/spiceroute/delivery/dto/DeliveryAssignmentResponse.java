package com.spiceroute.delivery.dto;

import com.spiceroute.delivery.entity.AssignmentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class DeliveryAssignmentResponse {
    private Long id;
    private Long orderId;
    private Long partnerId;
    private String partnerName;
    private AssignmentStatus status;
    private Double distanceKm;
    private Integer timeoutSeconds;
    private LocalDateTime offeredAt;
    private LocalDateTime respondedAt;

    // Embedded order summary
    private String customerName;
    private String customerPhone;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String deliveryAddress;
    private Double destLatitude;
    private Double destLongitude;
    private List<OrderItemResponse> items;
}
