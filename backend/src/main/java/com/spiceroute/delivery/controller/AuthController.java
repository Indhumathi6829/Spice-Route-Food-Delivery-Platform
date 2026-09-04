package com.spiceroute.delivery.controller;

import com.spiceroute.delivery.dto.*;
import com.spiceroute.delivery.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));
    }

    @PostMapping("/login")
    @Operation(summary = "Login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest req) {
        return ResponseEntity.ok(authService.refresh(req.getRefreshToken()));
    }

    @PostMapping("/device-token")
    @Operation(summary = "Register FCM device token for push notifications (any authenticated user)")
    public ResponseEntity<Void> registerToken(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.spiceroute.delivery.entity.User user,
            @Valid @RequestBody com.spiceroute.delivery.dto.DeviceTokenRequest req,
            com.spiceroute.delivery.service.FcmService fcmService,
            com.spiceroute.delivery.repository.UserRepository userRepository) {
        fcmService.registerToken(user.getId(), req.getToken(), req.getPlatform(), userRepository);
        return ResponseEntity.ok().build();
    }
}
