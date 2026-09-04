package com.spiceroute.delivery.controller;

import com.spiceroute.delivery.dto.CouponRequest;
import com.spiceroute.delivery.dto.CouponResponse;
import com.spiceroute.delivery.service.CouponService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@Tag(name = "Coupons")
public class CouponController {

    private final CouponService couponService;

    @GetMapping("/validate")
    public ResponseEntity<CouponResponse> validate(@RequestParam String code,
                                                   @RequestParam BigDecimal orderAmount) {
        return ResponseEntity.ok(couponService.validateAndPreview(code, orderAmount));
    }

    // Admin only
    @GetMapping
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<List<CouponResponse>> getAll() {
        return ResponseEntity.ok(couponService.getAll());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<CouponResponse> create(@Valid @RequestBody CouponRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(couponService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<CouponResponse> update(@PathVariable Long id,
                                                 @Valid @RequestBody CouponRequest req) {
        return ResponseEntity.ok(couponService.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        couponService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<CouponResponse> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.toggleActive(id));
    }
}
