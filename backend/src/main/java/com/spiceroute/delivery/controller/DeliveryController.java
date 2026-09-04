package com.spiceroute.delivery.controller;

import com.spiceroute.delivery.dto.*;
import com.spiceroute.delivery.entity.*;
import com.spiceroute.delivery.repository.DeliveryAssignmentRepository;
import com.spiceroute.delivery.repository.DeliveryPartnerRepository;
import com.spiceroute.delivery.repository.DeviceTokenRepository;
import com.spiceroute.delivery.repository.OrderRepository;
import com.spiceroute.delivery.repository.UserRepository;
import com.spiceroute.delivery.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery")
@RequiredArgsConstructor
@Tag(name = "Delivery Partner")
public class DeliveryController {

    private final DeliveryPartnerService     partnerService;
    private final DeliveryAssignmentService  assignmentService;
    private final OrderService               orderService;
    private final FcmService                 fcmService;
    private final DeviceTokenRepository      deviceTokenRepository;
    private final UserRepository             userRepository;
    private final DeliveryAssignmentRepository assignmentRepository;
    private final DeliveryPartnerRepository  partnerRepository;
    private final OrderRepository            orderRepository;

    // ── Profile ───────────────────────────────────────────────────────────────

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('DELIVERY_PARTNER','SUPER_ADMIN','RESTAURANT_ADMIN')")
    @Operation(summary = "Get delivery partner profile")
    public ResponseEntity<DeliveryPartnerResponse> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(partnerService.getProfile(user.getId()));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    public ResponseEntity<DeliveryPartnerResponse> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody DeliveryPartnerUpdateRequest req) {
        return ResponseEntity.ok(partnerService.updateProfile(user.getId(), req.getVehicleType(), req.getVehicleNumber()));
    }

    // ── Online / Offline ──────────────────────────────────────────────────────

    @PostMapping("/online")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    @Operation(summary = "Go online — start accepting deliveries")
    public ResponseEntity<DeliveryPartnerResponse> goOnline(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(partnerService.goOnline(user.getId()));
    }

    @PostMapping("/offline")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    @Operation(summary = "Go offline — stop accepting deliveries")
    public ResponseEntity<DeliveryPartnerResponse> goOffline(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(partnerService.goOffline(user.getId()));
    }

    // ── Location ──────────────────────────────────────────────────────────────

    @PostMapping("/location")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    @Operation(summary = "Update GPS location")
    public ResponseEntity<Void> updateLocation(@AuthenticationPrincipal User user,
                                               @Valid @RequestBody LocationUpdateRequest req) {
        partnerService.updateLocation(user.getId(), req);
        return ResponseEntity.ok().build();
    }

    // ── Assignment requests ───────────────────────────────────────────────────

    @GetMapping("/requests/pending")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    @Operation(summary = "Get the current pending delivery request (if any)")
    public ResponseEntity<?> getPendingRequest(@AuthenticationPrincipal User user) {
        return assignmentService.getPendingRequest(user.getId())
                .map(da -> ResponseEntity.ok(toAssignmentResponse(da)))
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/requests/{assignmentId}/accept")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    @Operation(summary = "Accept a delivery request")
    public ResponseEntity<Void> acceptRequest(@PathVariable Long assignmentId,
                                              @AuthenticationPrincipal User user) {
        assignmentService.acceptAssignment(assignmentId, user.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/requests/{assignmentId}/reject")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    @Operation(summary = "Reject a delivery request")
    public ResponseEntity<Void> rejectRequest(@PathVariable Long assignmentId,
                                              @AuthenticationPrincipal User user) {
        assignmentService.rejectAssignment(assignmentId, user.getId());
        return ResponseEntity.ok().build();
    }

    // ── Partner's active / history orders ────────────────────────────────────

    @GetMapping("/orders")
    @PreAuthorize("hasAnyRole('DELIVERY_PARTNER','SUPER_ADMIN')")
    @Operation(summary = "Get all orders assigned to this delivery partner")
    public ResponseEntity<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.getDeliveryPartnerOrders(user.getId()));
    }

    @GetMapping("/orders/available")
    @PreAuthorize("hasAnyRole('DELIVERY_PARTNER','SUPER_ADMIN')")
    @Operation(summary = "Get orders ready for pickup")
    public ResponseEntity<List<OrderResponse>> getAvailableOrders() {
        return ResponseEntity.ok(orderService.getAvailableForPickup());
    }

    // ── Order status updates from delivery partner ────────────────────────────

    @PatchMapping("/orders/{orderId}/status")
    @PreAuthorize("hasAnyRole('DELIVERY_PARTNER','SUPER_ADMIN')")
    @Operation(summary = "Update order status (PICKED_UP, DELIVERED, etc.)")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.updateStatus(orderId, status, user));
    }

    // ── Device tokens (FCM) ───────────────────────────────────────────────────

    @PostMapping("/device-token")
    @Operation(summary = "Register FCM device token for push notifications")
    public ResponseEntity<Void> registerToken(@AuthenticationPrincipal User user,
                                              @Valid @RequestBody DeviceTokenRequest req) {
        fcmService.registerToken(user.getId(), req.getToken(), req.getPlatform(), userRepository);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/device-token")
    @Operation(summary = "Deactivate FCM device token (on logout)")
    public ResponseEntity<Void> deactivateToken(@RequestBody DeviceTokenRequest req) {
        deviceTokenRepository.deactivateToken(req.getToken());
        return ResponseEntity.ok().build();
    }

    // ── Admin: all partners ───────────────────────────────────────────────────

    @GetMapping("/partners")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Get all delivery partners (admin)")
    public ResponseEntity<List<DeliveryPartnerResponse>> getAllPartners() {
        return ResponseEntity.ok(partnerService.getAllPartners());
    }

    @GetMapping("/partners/online")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Get online and available delivery partners (admin)")
    public ResponseEntity<List<DeliveryPartnerResponse>> getOnlinePartners() {
        return ResponseEntity.ok(partnerService.getOnlinePartners());
    }

    // ── Manual assignment (admin override) ───────────────────────────────────

    @PostMapping("/assign/{orderId}")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Manually start assignment algorithm for an order")
    public ResponseEntity<Map<String, String>> manualAssign(@PathVariable Long orderId) {
        assignmentService.startAssignment(orderId);
        return ResponseEntity.ok(Map.of("message", "Assignment process started for order " + orderId));
    }

    /**
     * Admin: get nearby available partners for a specific order, ranked by distance.
     * Used by the admin UI to show "Recommended Partners" with distances.
     */
    @GetMapping("/nearby-partners/{orderId}")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Get nearby available partners for an order (admin, location-ranked)")
    public ResponseEntity<List<DeliveryPartnerResponse>> getNearbyPartnersForOrder(@PathVariable Long orderId) {
        // Get order delivery address lat/lon as reference
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();

        Address addr = order.getDeliveryAddress();
        Double refLat = addr != null ? addr.getLatitude() : null;
        Double refLon = addr != null ? addr.getLongitude() : null;

        List<DeliveryPartner> onlinePartners = partnerRepository.findByIsOnlineTrueAndIsAvailableTrue();

        List<DeliveryPartnerResponse> result = onlinePartners.stream()
                .map(p -> {
                    double dist = 0.0;
                    if (refLat != null && refLon != null
                            && p.getCurrentLatitude() != null && p.getCurrentLongitude() != null) {
                        dist = com.spiceroute.delivery.util.GeoUtil.haversineKm(
                                refLat, refLon, p.getCurrentLatitude(), p.getCurrentLongitude());
                    }
                    DeliveryPartnerResponse r = partnerService.toResponse(p);
                    r.setDistanceKm(Math.round(dist * 100.0) / 100.0);
                    return r;
                })
                .sorted(java.util.Comparator.comparingDouble(r -> (r.getDistanceKm() != null ? r.getDistanceKm() : 999.0)))
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Admin: directly assign a specific partner to an order (manual override).
     */
    @PostMapping("/assign-partner/{orderId}/{partnerUserId}")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Directly assign a partner to an order (admin manual override)")
    public ResponseEntity<Map<String, String>> assignPartnerToOrder(
            @PathVariable Long orderId,
            @PathVariable Long partnerUserId) {
        orderService.manualAssignPartner(orderId, partnerUserId);
        return ResponseEntity.ok(Map.of("message", "Partner assigned to order " + orderId));
    }

    // ── Helper ───────────────────────────────────────────────────────────────

    private DeliveryAssignmentResponse toAssignmentResponse(DeliveryAssignment da) {
        Order order = da.getOrder();
        Address addr = order.getDeliveryAddress();
        String addrStr = addr.getHouseNumber() + ", " + addr.getStreet() + ", " + addr.getCity();

        List<OrderItemResponse> items = order.getItems().stream()
                .map(oi -> OrderItemResponse.builder()
                        .id(oi.getId())
                        .foodItemId(oi.getFoodItem().getId())
                        .foodItemName(oi.getFoodItem().getName())
                        .quantity(oi.getQuantity())
                        .priceAtOrderTime(oi.getPriceAtOrderTime())
                        .lineTotal(oi.getLineTotal())
                        .build())
                .toList();

        return DeliveryAssignmentResponse.builder()
                .id(da.getId())
                .orderId(order.getId())
                .partnerId(da.getPartner().getId())
                .partnerName(da.getPartner().getUser().getName())
                .status(da.getStatus())
                .distanceKm(da.getDistanceKm())
                .timeoutSeconds(da.getTimeoutSeconds())
                .offeredAt(da.getOfferedAt())
                .respondedAt(da.getRespondedAt())
                .customerName(order.getCustomer().getName())
                .customerPhone(order.getCustomer().getPhone())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod().name())
                .deliveryAddress(addrStr)
                .destLatitude(addr.getLatitude())
                .destLongitude(addr.getLongitude())
                .items(items)
                .build();
    }
}
