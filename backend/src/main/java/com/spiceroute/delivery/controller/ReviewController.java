package com.spiceroute.delivery.controller;

import com.spiceroute.delivery.dto.ReviewRequest;
import com.spiceroute.delivery.dto.ReviewResponse;
import com.spiceroute.delivery.entity.User;
import com.spiceroute.delivery.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews")
public class ReviewController {

    private final ReviewService reviewService;

    /** Public: paginated list of approved reviews */
    @GetMapping("/public")
    @Operation(summary = "Get all approved public reviews")
    public ResponseEntity<Page<ReviewResponse>> getPublic(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reviewService.getPublicReviews(page, size));
    }

    /** Public: reviews for a specific food item */
    @GetMapping("/food/{foodItemId}")
    @Operation(summary = "Get reviews for a specific food item (public)")
    public ResponseEntity<Page<ReviewResponse>> getByFoodItem(
            @PathVariable Long foodItemId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reviewService.getByFoodItem(foodItemId, page, size));
    }

    /** Delivery partner: get own reviews (authorized partner or admin) */
    @GetMapping("/delivery-partner/{partnerUserId}")
    @PreAuthorize("hasAnyRole('DELIVERY_PARTNER','RESTAURANT_ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Get delivery reviews for a partner")
    public ResponseEntity<Page<ReviewResponse>> getDeliveryPartnerReviews(
            @PathVariable Long partnerUserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user) {
        // Delivery partner can only see their own reviews; admin sees all
        if (user.getRole().name().equals("DELIVERY_PARTNER") && !user.getId().equals(partnerUserId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(reviewService.getDeliveryPartnerReviews(partnerUserId, page, size));
    }

    /** Delivery partner: get own rating stats */
    @GetMapping("/delivery-partner/{partnerUserId}/stats")
    @PreAuthorize("hasAnyRole('DELIVERY_PARTNER','RESTAURANT_ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Get delivery partner review stats (avg, count, distribution)")
    public ResponseEntity<java.util.Map<String, Object>> getDeliveryPartnerStats(
            @PathVariable Long partnerUserId,
            @AuthenticationPrincipal User user) {
        if (user.getRole().name().equals("DELIVERY_PARTNER") && !user.getId().equals(partnerUserId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(reviewService.getDeliveryPartnerStats(partnerUserId));
    }

    /** Customer: get own reviews */
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get customer's own reviews")
    public ResponseEntity<Page<ReviewResponse>> getMyReviews(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reviewService.getMyReviews(user.getId(), page, size));
    }

    /** Admin: all reviews */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Get all reviews (admin, paginated)")
    public ResponseEntity<Page<ReviewResponse>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(reviewService.getAllReviews(page, size));
    }

    /** Customer: get own review for a specific order */
    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get review for a specific order (owner only)")
    public ResponseEntity<ReviewResponse> getByOrder(@PathVariable Long orderId,
                                                     @AuthenticationPrincipal User user) {
        return reviewService.getByOrderId(orderId, user.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    /** Customer: create review for a delivered order */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Submit a review for a delivered order")
    public ResponseEntity<ReviewResponse> create(@AuthenticationPrincipal User user,
                                                 @Valid @RequestBody ReviewRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.create(user.getId(), req));
    }

    /** Customer: update own review */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Update own review")
    public ResponseEntity<ReviewResponse> update(@PathVariable Long id,
                                                 @AuthenticationPrincipal User user,
                                                 @Valid @RequestBody ReviewRequest req) {
        return ResponseEntity.ok(reviewService.update(id, user.getId(), req));
    }

    /** Customer: delete own review */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Delete own review")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @AuthenticationPrincipal User user) {
        reviewService.delete(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    /** Admin: toggle review approval */
    @PatchMapping("/{id}/toggle-approval")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Toggle review approval (admin only)")
    public ResponseEntity<Void> toggleApproval(@PathVariable Long id) {
        reviewService.toggleApproval(id);
        return ResponseEntity.noContent().build();
    }
}
