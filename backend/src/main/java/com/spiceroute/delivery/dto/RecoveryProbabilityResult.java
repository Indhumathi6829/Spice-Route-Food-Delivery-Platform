package com.spiceroute.delivery.dto;

import com.spiceroute.delivery.entity.RecoveryStrategy;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data @Builder
public class RecoveryProbabilityResult {
    private double recoveryProbability;   // 0.0 – 1.0
    private String riskLevel;             // HIGH_RECOVERY_POTENTIAL / MEDIUM / LOW / NO_RECOVERY
    private RecoveryStrategy recommendedStrategy;
    private List<String> reasons;
    private List<String> signals;         // raw signal descriptions for audit
}
