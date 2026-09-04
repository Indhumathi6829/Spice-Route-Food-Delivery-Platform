package com.spiceroute.delivery.service.impl;

import com.spiceroute.delivery.service.SmsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * Default no-op SMS implementation.
 * <p>
 * Active when {@code SMS_ENABLED} is {@code false} (or not set).
 * Logs the would-be SMS so developers can verify the flow without real credentials.
 * The application continues working normally — Firebase push notifications are still sent.
 * </p>
 */
@Service
@ConditionalOnProperty(name = "app.sms.enabled", havingValue = "false", matchIfMissing = true)
@Slf4j
public class NoOpSmsService implements SmsService {

    @Override
    public boolean send(String phoneNumber, String message) {
        log.info("[SMS-NOOP] Would send to {}: {}", phoneNumber, message);
        return true;
    }
}
