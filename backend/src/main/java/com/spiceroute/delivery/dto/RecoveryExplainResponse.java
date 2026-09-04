package com.spiceroute.delivery.dto;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class RecoveryExplainResponse {
    private Long orderId;
    private String explanation;   // LLM or rule-based natural-language explanation
    private boolean aiGenerated;  // true = came from LLM, false = rule-based fallback
}
