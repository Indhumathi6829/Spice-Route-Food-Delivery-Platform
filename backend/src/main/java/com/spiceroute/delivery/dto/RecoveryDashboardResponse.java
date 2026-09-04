package com.spiceroute.delivery.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data @Builder
public class RecoveryDashboardResponse {
    private BigDecimal potentialLostRevenue;
    private BigDecimal recoveredRevenue;
    private double recoveryRate;            // percentage
    private Long totalFailedPayments;
    private Long totalRecoveryAttempts;
    private Long successfulRecoveries;
    private Long inProgressCount;
    private Long pendingCount;
    private Long failedCount;
    private Long cancelledCount;
    private BigDecimal averageRecoveredValue;
    private List<RecoveryAttemptSummary> recentAttempts;

    @Data @Builder
    public static class RecoveryAttemptSummary {
        private Long attemptId;
        private Long orderId;
        private String customerName;
        private BigDecimal amount;
        private String status;
        private String strategy;
        private double probability;
        private String createdAt;
        private String failureReason;
    }
}
