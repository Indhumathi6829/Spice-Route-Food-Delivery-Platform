package com.spiceroute.delivery.entity;

public enum RecoveryStrategy {
    PAYMENT_RETRY,
    ALTERNATIVE_PAYMENT_METHOD,
    ABANDONED_CART_RECOVERY,
    GRACEFUL_STOP
}
