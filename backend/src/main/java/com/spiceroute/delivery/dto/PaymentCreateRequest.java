package com.spiceroute.delivery.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentCreateRequest {
    @NotNull private Long orderId;
}
