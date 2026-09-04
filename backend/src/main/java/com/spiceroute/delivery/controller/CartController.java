package com.spiceroute.delivery.controller;

import com.spiceroute.delivery.dto.CartItemRequest;
import com.spiceroute.delivery.dto.CartResponse;
import com.spiceroute.delivery.entity.User;
import com.spiceroute.delivery.service.CartService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(cartService.getCart(user.getId()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(@AuthenticationPrincipal User user,
                                                @Valid @RequestBody CartItemRequest req) {
        return ResponseEntity.ok(cartService.addItem(user.getId(), req));
    }

    @PatchMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateItem(@AuthenticationPrincipal User user,
                                                   @PathVariable Long itemId,
                                                   @RequestParam int quantity) {
        return ResponseEntity.ok(cartService.updateItem(user.getId(), itemId, quantity));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeItem(@AuthenticationPrincipal User user,
                                                   @PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeItem(user.getId(), itemId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal User user) {
        cartService.clearCart(user.getId());
        return ResponseEntity.noContent().build();
    }
}
