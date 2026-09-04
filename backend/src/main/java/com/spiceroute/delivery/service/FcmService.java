package com.spiceroute.delivery.service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.*;
import com.spiceroute.delivery.entity.DeviceToken;
import com.spiceroute.delivery.repository.DeviceTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FcmService {

    private final DeviceTokenRepository deviceTokenRepository;

    @Value("${app.firebase.enabled:false}")
    private boolean firebaseEnabled;

    /** Register or refresh a device token for a user */
    @Transactional
    public void registerToken(Long userId, String token, String platform,
                              com.spiceroute.delivery.repository.UserRepository userRepository) {
        deviceTokenRepository.findByToken(token).ifPresentOrElse(
            existing -> {
                existing.setActive(true);
                existing.setLastUsedAt(java.time.LocalDateTime.now());
                deviceTokenRepository.save(existing);
            },
            () -> {
                var user = userRepository.findById(userId).orElseThrow();
                var dt = com.spiceroute.delivery.entity.DeviceToken.builder()
                        .user(user).token(token).platform(platform).build();
                deviceTokenRepository.save(dt);
            }
        );
    }

    /** Send notification to ALL active devices of a user */
    @Async
    public void sendToUser(Long userId, String title, String body, Map<String, String> data) {
        if (!isFirebaseReady()) return;

        List<DeviceToken> tokens = deviceTokenRepository.findByUserIdAndActiveTrue(userId);
        if (tokens.isEmpty()) return;

        tokens.forEach(dt -> sendToToken(dt.getToken(), title, body, data));
    }

    /** Send to a specific FCM token */
    public void sendToToken(String token, String title, String body, Map<String, String> data) {
        if (!isFirebaseReady()) return;

        try {
            Message.Builder builder = Message.builder()
                    .setToken(token)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .putAllData(data != null ? data : Map.of());

            String response = FirebaseMessaging.getInstance().send(builder.build());
            log.debug("FCM sent: {}", response);
        } catch (FirebaseMessagingException e) {
            log.warn("FCM send failed for token {}: {}", token.substring(0, Math.min(10, token.length())), e.getMessage());
            // Deactivate invalid tokens
            if (e.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED ||
                e.getMessagingErrorCode() == MessagingErrorCode.INVALID_ARGUMENT) {
                deviceTokenRepository.deactivateToken(token);
            }
        }
    }

    private boolean isFirebaseReady() {
        return firebaseEnabled && !FirebaseApp.getApps().isEmpty();
    }
}
