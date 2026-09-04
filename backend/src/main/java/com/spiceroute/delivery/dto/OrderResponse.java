package com.spiceroute.delivery.dto;

import com.spiceroute.delivery.entity.OrderStatus;
import com.spiceroute.delivery.entity.PaymentMethod;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private Long deliveryPartnerId;
    private String deliveryPartnerName;
    private String deliveryPartnerPhone;
    private AddressResponse deliveryAddress;
    private OrderStatus status;
    private BigDecimal subtotal;
    private BigDecimal deliveryFee;
    private BigDecimal tax;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String couponCode;
    private Integer etaMinutes;
    private String specialInstructions;
    private PaymentMethod paymentMethod;
    private String paymentStatus;
    private List<OrderItemResponse> items;
    private List<StatusHistoryResponse> statusHistory;
    private LocalDateTime placedAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime preparingAt;
    private LocalDateTime readyAt;
    private LocalDateTime pickedUpAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime cancelledAt;
    private Boolean hasReview;
}
