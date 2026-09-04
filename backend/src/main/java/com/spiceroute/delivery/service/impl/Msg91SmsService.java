package com.spiceroute.delivery.service.impl;

import com.spiceroute.delivery.service.SmsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * MSG91 SMS provider implementation.
 * <p>
 * Activated when {@code SMS_ENABLED=true} and {@code SMS_PROVIDER=msg91}.
 * Requires:
 * <pre>
 *   SMS_ENABLED=true
 *   SMS_PROVIDER=msg91
 *   SMS_API_KEY=&lt;your MSG91 authkey&gt;
 *   SMS_FROM=SpiceRt       # 6-char sender ID
 * </pre>
 * </p>
 */
@Service
@ConditionalOnProperty(name = "app.sms.provider", havingValue = "msg91")
@Slf4j
public class Msg91SmsService implements SmsService {

    @Value("${app.sms.api-key:}")
    private String authKey;

    @Value("${app.sms.from:SpiceRt}")
    private String senderId;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public boolean send(String phoneNumber, String message) {
        if (authKey == null || authKey.isBlank()) {
            log.warn("[MSG91] API key not configured — SMS skipped for {}", phoneNumber);
            return false;
        }
        try {
            // Strip leading + or country code prefix for MSG91
            String mobile = phoneNumber.startsWith("+91") ? phoneNumber.substring(3)
                    : phoneNumber.startsWith("+") ? phoneNumber.substring(1) : phoneNumber;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("authkey", authKey);

            Map<String, Object> body = Map.of(
                    "sender",    senderId,
                    "route",     "4",
                    "country",   "91",
                    "sms", new Object[]{Map.of(
                            "message", message,
                            "to",      new String[]{mobile}
                    )}
            );

            ResponseEntity<String> response = restTemplate.exchange(
                    "https://api.msg91.com/api/sendhttp.php",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    String.class
            );

            boolean ok = response.getStatusCode().is2xxSuccessful();
            if (ok) log.info("[MSG91] SMS sent to {}", phoneNumber);
            else    log.warn("[MSG91] SMS failed for {}: {}", phoneNumber, response.getBody());
            return ok;
        } catch (Exception ex) {
            log.error("[MSG91] Exception sending SMS to {}: {}", phoneNumber, ex.getMessage());
            return false;
        }
    }
}
