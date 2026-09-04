package com.spiceroute.delivery.controller;

import com.spiceroute.delivery.dto.FestivalOfferRequest;
import com.spiceroute.delivery.dto.FestivalOfferResponse;
import com.spiceroute.delivery.service.FestivalOfferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/festival-offers")
@RequiredArgsConstructor
@Tag(name = "Festival Offers")
public class FestivalOfferController {

    private final FestivalOfferService service;

    /** Public: currently active banners for the home page */
    @GetMapping("/active")
    @Operation(summary = "Get currently active festival offers (public)")
    public ResponseEntity<List<FestivalOfferResponse>> getActive() {
        return ResponseEntity.ok(service.getActiveOffers());
    }

    /** Admin: all offers */
    @GetMapping
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Get all festival offers (admin)")
    public ResponseEntity<List<FestivalOfferResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<FestivalOfferResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Create a new festival offer")
    public ResponseEntity<FestivalOfferResponse> create(@Valid @RequestBody FestivalOfferRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Update a festival offer")
    public ResponseEntity<FestivalOfferResponse> update(@PathVariable Long id,
                                                        @Valid @RequestBody FestivalOfferRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Delete a festival offer")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Toggle active/inactive status of a festival offer")
    public ResponseEntity<FestivalOfferResponse> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(service.toggleActive(id));
    }
}
