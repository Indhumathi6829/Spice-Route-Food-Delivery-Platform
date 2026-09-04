package com.spiceroute.delivery.controller;

import com.spiceroute.delivery.dto.DeliveryAssignmentResponse;
import com.spiceroute.delivery.dto.OrderResponse;
import com.spiceroute.delivery.dto.PlaceOrderRequest;
import com.spiceroute.delivery.entity.AssignmentStatus;
import com.spiceroute.delivery.entity.DeliveryAssignment;
import com.spiceroute.delivery.entity.DeliveryPartner;
import com.spiceroute.delivery.entity.Order;
import com.spiceroute.delivery.entity.OrderStatus;
import com.spiceroute.delivery.entity.Role;
import com.spiceroute.delivery.entity.User;
import com.spiceroute.delivery.exception.ResourceNotFoundException;
import com.spiceroute.delivery.repository.DeliveryAssignmentRepository;
import com.spiceroute.delivery.repository.DeliveryPartnerRepository;
import com.spiceroute.delivery.repository.OrderRepository;
import com.spiceroute.delivery.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders")
public class OrderController {

    private final OrderService                 orderService;
    private final OrderRepository              orderRepository;
    private final DeliveryAssignmentRepository assignmentRepository;
    private final DeliveryPartnerRepository    partnerRepository;

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@AuthenticationPrincipal User user,
                                                    @Valid @RequestBody PlaceOrderRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.placeOrder(user.getId(), req));
    }

    @GetMapping
    public ResponseEntity<Page<OrderResponse>> myOrders(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getCustomerOrders(user.getId(), page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id,
                                                  @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.getOrder(id, user.getId(), user.getRole()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','DELIVERY_PARTNER','SUPER_ADMIN','CUSTOMER')")
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable Long id,
                                                      @RequestParam OrderStatus status,
                                                      @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.updateStatus(id, status, user));
    }

    // Admin endpoints
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<List<OrderResponse>> getActiveOrders() {
        return ResponseEntity.ok(orderService.getActiveOrders());
    }

    @PatchMapping("/{id}/assign-delivery")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<OrderResponse> assignDelivery(@PathVariable Long id,
                                                        @RequestParam Long partnerId) {
        return ResponseEntity.ok(orderService.assignDeliveryPartner(id, partnerId));
    }

    // Delivery partner
    @GetMapping("/available-for-pickup")
    @PreAuthorize("hasAnyRole('DELIVERY_PARTNER','SUPER_ADMIN')")
    public ResponseEntity<List<OrderResponse>> availableForPickup() {
        return ResponseEntity.ok(orderService.getAvailableForPickup());
    }

    @GetMapping("/my-deliveries")
    @PreAuthorize("hasAnyRole('DELIVERY_PARTNER')")
    public ResponseEntity<List<OrderResponse>> myDeliveries(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.getDeliveryPartnerOrders(user.getId()));
    }

    // ── Customer live-tracking endpoints ─────────────────────────────────────

    /**
     * GET /api/orders/{id}/assignment
     *
     * Returns the accepted DeliveryAssignment for the given order so the
     * customer app can show partner name, vehicle, rating, distance, and status.
     *
     * Access: owner customer | DELIVERY_PARTNER assigned to this order | admins
     */
    @GetMapping("/{id}/assignment")
    @Operation(summary = "Get the accepted delivery assignment for an order (customer tracking)")
    public ResponseEntity<DeliveryAssignmentResponse> getAssignment(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        // Authorization: customer must own the order; admins and the assigned
        // delivery partner are also allowed.
        boolean isAdmin   = user.getRole() == Role.SUPER_ADMIN || user.getRole() == Role.RESTAURANT_ADMIN;
        boolean isOwner   = order.getCustomer().getId().equals(user.getId());
        boolean isPartner = order.getDeliveryPartner() != null
                            && order.getDeliveryPartner().getId().equals(user.getId());

        if (!isAdmin && !isOwner && !isPartner) {
            throw new AccessDeniedException("Not authorized to view this order's assignment");
        }

        // Look for an ACCEPTED assignment first, fall back to PENDING
        DeliveryAssignment assignment = assignmentRepository
                .findByOrderIdAndStatus(id, AssignmentStatus.ACCEPTED)
                .or(() -> assignmentRepository.findByOrderIdAndStatus(id, AssignmentStatus.PENDING))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No active assignment found for order " + id));

        DeliveryPartner partner  = assignment.getPartner();
        User            pUser    = partner.getUser();

        DeliveryAssignmentResponse resp = DeliveryAssignmentResponse.builder()
                .id(assignment.getId())
                .orderId(order.getId())
                .partnerId(pUser.getId())
                .partnerName(pUser.getName())
                .status(assignment.getStatus())
                .distanceKm(assignment.getDistanceKm())
                .timeoutSeconds(assignment.getTimeoutSeconds())
                .offeredAt(assignment.getOfferedAt())
                .respondedAt(assignment.getRespondedAt())
                .customerName(order.getCustomer().getName())
                .customerPhone(order.getCustomer().getPhone())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod().name())
                .build();

        return ResponseEntity.ok(resp);
    }

    /**
     * GET /api/orders/{id}/partner-location
     *
     * Returns the delivery partner's current GPS coordinates for the live
     * tracking map on the customer app/website.
     *
     * Returns 204 No Content when no partner is assigned yet or location is
     * not yet available (e.g. partner hasn't sent a GPS update).
     *
     * Access: same as /assignment
     */
    @GetMapping("/{id}/partner-location")
    @Operation(summary = "Get the delivery partner's current GPS location for live tracking")
    public ResponseEntity<Map<String, Object>> getPartnerLocation(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        boolean isAdmin   = user.getRole() == Role.SUPER_ADMIN || user.getRole() == Role.RESTAURANT_ADMIN;
        boolean isOwner   = order.getCustomer().getId().equals(user.getId());
        boolean isPartner = order.getDeliveryPartner() != null
                            && order.getDeliveryPartner().getId().equals(user.getId());

        if (!isAdmin && !isOwner && !isPartner) {
            throw new AccessDeniedException("Not authorized to view this order's tracking data");
        }

        // No partner assigned yet
        if (order.getDeliveryPartner() == null) {
            return ResponseEntity.noContent().build();
        }

        // Look up the DeliveryPartner profile to get current lat/lon
        return partnerRepository.findByUserId(order.getDeliveryPartner().getId())
                .filter(p -> p.getCurrentLatitude() != null && p.getCurrentLongitude() != null)
                .map(p -> ResponseEntity.ok(Map.<String, Object>of(
                        "latitude",    p.getCurrentLatitude(),
                        "longitude",   p.getCurrentLongitude(),
                        "lastUpdated", p.getLastLocationUpdate() != null
                                        ? p.getLastLocationUpdate().toString() : "",
                        "partnerName", p.getUser().getName(),
                        "orderId",     id
                )))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
