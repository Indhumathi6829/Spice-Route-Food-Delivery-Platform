package com.spiceroute.delivery.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.net.http.HttpClient;
import java.time.Duration;

/**
 * Configuration for the AI Revenue Recovery module.
 *
 * Uses Java 21's built-in HttpClient to call OpenAI — no extra dependency.
 * If AI_ENABLED=false or the key is blank, all LLM calls are skipped and
 * the agent falls back to rule-based explanations. The food delivery app
 * continues working regardless.
 */
@Configuration
@Getter
public class AiRecoveryConfig {

    @Value("${app.ai.openai.api-key:}")
    private String openAiApiKey;

    @Value("${app.ai.openai.model:gpt-4o-mini}")
    private String openAiModel;

    @Value("${app.ai.openai.enabled:false}")
    private boolean aiEnabled;

    @Value("${app.recovery.max-attempts:3}")
    private int maxRecoveryAttempts;

    @Value("${app.recovery.expiry-hours:24}")
    private int recoveryExpiryHours;

    /** Shared HttpClient — thread-safe, reuse across requests */
    public HttpClient httpClient() {
        return HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public boolean isAiAvailable() {
        return aiEnabled && openAiApiKey != null && !openAiApiKey.isBlank();
    }
}
