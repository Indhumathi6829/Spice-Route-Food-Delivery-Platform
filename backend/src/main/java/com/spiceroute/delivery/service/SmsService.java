package com.spiceroute.delivery.service;

/**
 * SMS provider abstraction.
 * <p>
 * Implement this interface with a concrete provider (Twilio, MSG91, etc.).
 * The default {@link NoOpSmsService} is used when SMS is disabled or
 * credentials are not configured — the application continues working normally
 * and all notifications still flow through Firebase/FCM.
 * </p>
 *
 * <p>Required environment variables when a real provider is plugged in:</p>
 * <pre>
 *   SMS_ENABLED=true
 *   SMS_PROVIDER=twilio          # or msg91, etc.
 *   SMS_API_KEY=&lt;api key / account SID&gt;
 *   SMS_API_SECRET=&lt;auth token / api secret&gt;
 *   SMS_FROM=+919XXXXXXXXX       # sender number / sender ID
 * </pre>
 */
public interface SmsService {

    /**
     * Send a text message to {@code phoneNumber}.
     *
     * @param phoneNumber E.164 format, e.g. "+919876543210"
     * @param message     Message body (keep under 160 chars for a single SMS)
     * @return true if the SMS was dispatched (or gracefully skipped), false on error
     */
    boolean send(String phoneNumber, String message);

    /** Convenience: send OTP */
    default boolean sendOtp(String phoneNumber, String otp) {
        return send(phoneNumber, "Your SpiceRoute Kitchen OTP is: " + otp + ". Valid for 10 minutes. Do not share.");
    }

    /** Convenience: order confirmed */
    default boolean sendOrderConfirmed(String phoneNumber, Long orderId, String total) {
        return send(phoneNumber,
                "SpiceRoute Kitchen: Your order #" + orderId + " (₹" + total + ") is confirmed. Track your order in the app.");
    }

    /** Convenience: delivery assigned */
    default boolean sendDeliveryAssigned(String phoneNumber, String partnerName) {
        return send(phoneNumber,
                "SpiceRoute Kitchen: " + partnerName + " is heading your way! Track live in the app.");
    }

    /** Convenience: order delivered */
    default boolean sendOrderDelivered(String phoneNumber, Long orderId) {
        return send(phoneNumber,
                "SpiceRoute Kitchen: Order #" + orderId + " delivered! Enjoy your meal. Rate your experience in the app.");
    }
}
