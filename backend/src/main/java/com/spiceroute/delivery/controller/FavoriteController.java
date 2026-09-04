package com.spiceroute.delivery.controller;

import com.spiceroute.delivery.dto.FoodItemResponse;
import com.spiceroute.delivery.entity.User;
import com.spiceroute.delivery.service.FavoriteService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@Tag(name = "Favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<List<FoodItemResponse>> getFavorites(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(favoriteService.getFavorites(user.getId()));
    }

    @PostMapping("/{foodItemId}")
    public ResponseEntity<Void> add(@AuthenticationPrincipal User user, @PathVariable Long foodItemId) {
        favoriteService.addFavorite(user.getId(), foodItemId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{foodItemId}")
    public ResponseEntity<Void> remove(@AuthenticationPrincipal User user, @PathVariable Long foodItemId) {
        favoriteService.removeFavorite(user.getId(), foodItemId);
        return ResponseEntity.noContent().build();
    }
}
