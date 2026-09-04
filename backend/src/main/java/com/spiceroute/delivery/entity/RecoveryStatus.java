package com.spiceroute.delivery.entity;

public enum RecoveryStatus {
    PENDING,        // Recovery agent has been triggered, not yet acted
    IN_PROGRESS,    // Recovery is actively being attempted
    RECOVERED,      // Payment eventually succeeded
    FAILED,         // All strategies exhausted, no recovery
    CANCELLED,      // Customer cancelled / restaurant closed
    EXPIRED         // Recovery window passed (e.g. >24h)
}
