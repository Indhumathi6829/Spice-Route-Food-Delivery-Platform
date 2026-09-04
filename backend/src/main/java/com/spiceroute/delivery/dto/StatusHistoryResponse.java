package com.spiceroute.delivery.dto;

import com.spiceroute.delivery.entity.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class StatusHistoryResponse {
    private OrderStatus status;
    private String note;
    private LocalDateTime timestamp;
}
