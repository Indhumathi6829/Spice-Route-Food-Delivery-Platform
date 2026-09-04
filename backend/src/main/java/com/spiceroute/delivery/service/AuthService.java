package com.spiceroute.delivery.service;

import com.spiceroute.delivery.dto.AuthResponse;
import com.spiceroute.delivery.dto.LoginRequest;
import com.spiceroute.delivery.dto.RegisterRequest;
import com.spiceroute.delivery.entity.DeliveryPartner;
import com.spiceroute.delivery.entity.Role;
import com.spiceroute.delivery.entity.User;
import com.spiceroute.delivery.exception.BusinessException;
import com.spiceroute.delivery.repository.DeliveryPartnerRepository;
import com.spiceroute.delivery.repository.UserRepository;
import com.spiceroute.delivery.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;

    /**
     * Admin registration code — set via ADMIN_REGISTRATION_CODE env var.
     * Defaults to __DISABLED__ which prevents all public admin registration.
     */
    @Value("${app.auth.admin-registration-code:__DISABLED__}")
    private String adminRegistrationCode;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BusinessException("Email is already registered");
        }

        // CUSTOMER and DELIVERY_PARTNER may register freely.
        // RESTAURANT_ADMIN and SUPER_ADMIN require a valid admin registration code.
        Role requestedRole = req.getRole() != null ? req.getRole() : Role.CUSTOMER;

        if (requestedRole == Role.SUPER_ADMIN || requestedRole == Role.RESTAURANT_ADMIN) {
            String providedCode = req.getAdminCode();
            if (providedCode == null || adminRegistrationCode.equals("__DISABLED__")
                    || !providedCode.equals(adminRegistrationCode)) {
                throw new BusinessException(
                        "Admin registration requires a valid authorization code. " +
                        "Please contact the system administrator.");
            }
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .role(requestedRole)
                .build();

        User saved = userRepository.save(user);
        log.info("New user registered: {} ({})", saved.getEmail(), saved.getRole());

        // Auto-create DeliveryPartner profile so the admin dashboard count is always accurate
        if (requestedRole == Role.DELIVERY_PARTNER) {
            DeliveryPartner profile = DeliveryPartner.builder()
                    .user(saved)
                    .isOnline(false)
                    .isAvailable(true)
                    .build();
            deliveryPartnerRepository.save(profile);
            log.info("Created DeliveryPartner profile for new user {}", saved.getEmail());
        }

        String token        = jwtUtil.generateToken(saved);
        String refreshToken = jwtUtil.generateRefreshToken(saved);
        return buildAuthResponse(saved, token, refreshToken);
    }

    public AuthResponse login(LoginRequest req) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );
        } catch (BadCredentialsException ex) {
            throw new BusinessException("Invalid email or password");
        }

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new BusinessException("User not found"));

        if (!user.isActive()) {
            throw new BusinessException("Your account has been deactivated. Contact support.");
        }

        String token        = jwtUtil.generateToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);
        return buildAuthResponse(user, token, refreshToken);
    }

    public AuthResponse refresh(String refreshToken) {
        try {
            String email = jwtUtil.extractUsername(refreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new BusinessException("User not found"));
            String newToken   = jwtUtil.generateToken(user);
            String newRefresh = jwtUtil.generateRefreshToken(user);
            return buildAuthResponse(user, newToken, newRefresh);
        } catch (Exception ex) {
            throw new BusinessException("Invalid or expired refresh token");
        }
    }

    private AuthResponse buildAuthResponse(User user, String token, String refreshToken) {
        return AuthResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profileImage(user.getProfileImage())
                .role(user.getRole())
                .token(token)
                .refreshToken(refreshToken)
                .build();
    }
}
