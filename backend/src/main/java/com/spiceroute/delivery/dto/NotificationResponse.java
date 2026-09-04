package com.spiceroute.delivery.dto;

import com.spiceroute.delivery.entity.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private Long referenceId;
    private Boolean read;
    private LocalDateTime createdAt;
}
