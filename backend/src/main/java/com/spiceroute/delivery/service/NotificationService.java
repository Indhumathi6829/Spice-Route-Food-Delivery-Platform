package com.spiceroute.delivery.service;

import com.spiceroute.delivery.dto.NotificationResponse;
import com.spiceroute.delivery.entity.*;
import com.spiceroute.delivery.repository.NotificationRepository;
import com.spiceroute.delivery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private FcmService fcmService;

    @org.springframework.beans.factory.annotation.Autowired
    public void setFcmService(FcmService fcmService) { this.fcmService = fcmService; }

    @Async
    public void send(Long userId, String title, String message, NotificationType type, Long referenceId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        Notification notif = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .build();
        Notification saved = notificationRepository.save(notif);

        // Push real-time notification via WebSocket
        messagingTemplate.convertAndSend("/topic/notifications/" + userId, toResponse(saved));

        // Firebase push notification
        if (fcmService != null) {
            fcmService.sendToUser(userId, title, message,
                    java.util.Map.of("type", type.name(),
                                     "referenceId", referenceId != null ? referenceId.toString() : ""));
        }
    }

    public Page<NotificationResponse> getForUser(Long userId, int page, int size) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.markAllReadForUser(userId);
    }

    @Transactional
    public void markRead(Long notifId) {
        notificationRepository.findById(notifId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .referenceId(n.getReferenceId())
                .read(n.getRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
