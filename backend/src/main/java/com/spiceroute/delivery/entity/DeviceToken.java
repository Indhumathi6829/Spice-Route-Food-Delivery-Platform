package com.spiceroute.delivery.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Firebase FCM device tokens per user.
 * A user can have multiple devices (web, mobile, tablet).
 */
@Entity
@Table(name = "device_tokens", indexes = {
    @Index(name = "idx_dt_user",  columnList = "user_id"),
    @Index(name = "idx_dt_token", columnList = "token", unique = true)
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeviceToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 512)
    private String token;

    private String platform;  // ANDROID, IOS, WEB

    @Builder.Default
    private Boolean active = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime lastUsedAt;

    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }
}
