package com.spiceroute.delivery.controller;

import com.spiceroute.delivery.dto.AnalyticsResponse;
import com.spiceroute.delivery.entity.Role;
import com.spiceroute.delivery.entity.User;
import com.spiceroute.delivery.repository.UserRepository;
import com.spiceroute.delivery.service.AnalyticsService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
@Tag(name = "Admin")
public class AdminController {

    private final AnalyticsService analyticsService;
    private final UserRepository   userRepository;

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(analyticsService.getDashboard());
    }

    @GetMapping("/customers")
    public ResponseEntity<List<User>> getCustomers() {
        return ResponseEntity.ok(userRepository.findByRole(Role.CUSTOMER));
    }

    @GetMapping("/delivery-partners")
    public ResponseEntity<List<User>> getDeliveryPartners() {
        return ResponseEntity.ok(userRepository.findByRole(Role.DELIVERY_PARTNER));
    }

    @PatchMapping("/users/{id}/toggle-active")
    public ResponseEntity<Map<String, Object>> toggleUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new com.spiceroute.delivery.exception.ResourceNotFoundException("User", id));
        user.setActive(!user.isActive());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("id", id, "active", user.isActive()));
    }
}
