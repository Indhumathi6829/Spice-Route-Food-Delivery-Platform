package com.spiceroute.delivery.entity;

public enum AssignmentStatus {
    PENDING,     // Offer sent — waiting for partner response
    ACCEPTED,    // Partner accepted
    REJECTED,    // Partner rejected
    TIMED_OUT,   // Partner did not respond in time
    CANCELLED    // Assignment cancelled (order cancelled, etc.)
}
