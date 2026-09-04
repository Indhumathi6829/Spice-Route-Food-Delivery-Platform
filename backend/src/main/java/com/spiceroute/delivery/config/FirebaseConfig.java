package com.spiceroute.delivery.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

@Configuration
@Slf4j
public class FirebaseConfig {

    @Value("${app.firebase.credentials-path:firebase-service-account.json}")
    private String credentialsPath;

    @Value("${app.firebase.enabled:false}")
    private boolean firebaseEnabled;

    @PostConstruct
    public void initialize() {
        if (!firebaseEnabled) {
            log.info("Firebase disabled — set app.firebase.enabled=true and provide credentials to enable push notifications.");
            return;
        }

        if (!FirebaseApp.getApps().isEmpty()) {
            log.info("Firebase already initialized.");
            return;
        }

        try {
            InputStream serviceAccount;
            // Try classpath first, then absolute path
            try {
                serviceAccount = new ClassPathResource(credentialsPath).getInputStream();
            } catch (IOException e) {
                serviceAccount = new java.io.FileInputStream(credentialsPath);
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
            log.info("✅ Firebase initialized successfully");
        } catch (IOException e) {
            log.warn("⚠️  Firebase credentials not found at '{}'. Push notifications disabled. " +
                     "Place firebase-service-account.json in src/main/resources/", credentialsPath);
        }
    }
}
