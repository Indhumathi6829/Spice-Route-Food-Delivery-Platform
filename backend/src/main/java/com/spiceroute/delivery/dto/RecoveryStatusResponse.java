package com.spiceroute.delivery.dto;

import com.spiceroute.delivery.entity.RecoveryStatus;
import com.spiceroute.delivery.entity.RecoveryStrategy;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class RecoveryStatusResponse {
    private Long attemptId;
    private Long orderId;
    private RecoveryStatus status;
    private RecoveryStrategy selectedStrategy;
    private double recoveryProbability;
    private String riskLevel;
    private List<String> reasons;
    private BigDecimal recoveryAmount;
    private Integer attemptCount;
    private String recoveryGatewayOrderId;
    private String recoveryTransactionId;
    private String failureReason;
    private String failureCode;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AuditLogEntry> auditLog;

    @Data @Builder
    public static class AuditLogEntry {
        private String event;
        private String strategy;
        private String details;
        private String result;
        private LocalDateTime timestamp;
    }
}
