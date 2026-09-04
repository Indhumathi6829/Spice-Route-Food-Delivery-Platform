package com.spiceroute.delivery.controller;

import com.spiceroute.delivery.dto.FoodItemRequest;
import com.spiceroute.delivery.dto.FoodItemResponse;
import com.spiceroute.delivery.entity.User;
import com.spiceroute.delivery.service.FoodItemService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
@Tag(name = "Food Items")
public class FoodItemController {

    private final FoodItemService foodItemService;

    @GetMapping
    public ResponseEntity<Page<FoodItemResponse>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean vegetarian,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false, defaultValue = "rating") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User currentUser) {
        Long uid = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(foodItemService.search(q, categoryId, vegetarian,
                minPrice, maxPrice, sortBy, sortDir, page, size, uid));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodItemResponse> getById(@PathVariable Long id,
                                                    @AuthenticationPrincipal User currentUser) {
        Long uid = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(foodItemService.getById(id, uid));
    }

    @GetMapping("/bestsellers")
    public ResponseEntity<List<FoodItemResponse>> getBestsellers() {
        return ResponseEntity.ok(foodItemService.getBestsellers());
    }

    @GetMapping("/top-rated")
    public ResponseEntity<List<FoodItemResponse>> getTopRated(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(foodItemService.getTopRated(limit));
    }

    @GetMapping("/popular")
    public ResponseEntity<List<FoodItemResponse>> getPopular(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(foodItemService.getMostPopular(limit));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<FoodItemResponse>> getByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(foodItemService.getByCategory(categoryId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<FoodItemResponse> create(@Valid @RequestBody FoodItemRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(foodItemService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<FoodItemResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody FoodItemRequest req) {
        return ResponseEntity.ok(foodItemService.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        foodItemService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-availability")
    @PreAuthorize("hasAnyRole('RESTAURANT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<FoodItemResponse> toggleAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(foodItemService.toggleAvailability(id));
    }
}
