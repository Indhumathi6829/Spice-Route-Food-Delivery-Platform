package com.spiceroute.delivery.dto;

import com.spiceroute.delivery.entity.PaymentMethod;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class PlaceOrderRequest {

    @NotNull private Long addressId;

    @NotEmpty private List<OrderItemRequest> items;

    private String couponCode;

    private String specialInstructions;

    @NotNull private PaymentMethod paymentMethod;
}
