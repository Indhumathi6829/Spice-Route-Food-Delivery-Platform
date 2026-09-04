package com.spiceroute.delivery.service;

import com.spiceroute.delivery.dto.FoodItemResponse;
import com.spiceroute.delivery.entity.Favorite;
import com.spiceroute.delivery.entity.FoodItem;
import com.spiceroute.delivery.entity.User;
import com.spiceroute.delivery.exception.BusinessException;
import com.spiceroute.delivery.exception.ResourceNotFoundException;
import com.spiceroute.delivery.repository.FavoriteRepository;
import com.spiceroute.delivery.repository.FoodItemRepository;
import com.spiceroute.delivery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final FoodItemRepository foodItemRepository;
    private final UserRepository     userRepository;
    private final FoodItemService    foodItemService;

    public List<FoodItemResponse> getFavorites(Long userId) {
        return favoriteRepository.findByUserId(userId).stream()
                .map(f -> foodItemService.toResponse(f.getFoodItem(), userId))
                .toList();
    }

    @Transactional
    public void addFavorite(Long userId, Long foodItemId) {
        if (favoriteRepository.existsByUserIdAndFoodItemId(userId, foodItemId)) {
            throw new BusinessException("Item is already in your favorites");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        FoodItem food = foodItemRepository.findById(foodItemId)
                .orElseThrow(() -> new ResourceNotFoundException("FoodItem", foodItemId));

        favoriteRepository.save(Favorite.builder().user(user).foodItem(food).build());
    }

    @Transactional
    public void removeFavorite(Long userId, Long foodItemId) {
        if (!favoriteRepository.existsByUserIdAndFoodItemId(userId, foodItemId)) {
            throw new BusinessException("Item is not in your favorites");
        }
        favoriteRepository.deleteByUserIdAndFoodItemId(userId, foodItemId);
    }

    public boolean isFavorite(Long userId, Long foodItemId) {
        return favoriteRepository.existsByUserIdAndFoodItemId(userId, foodItemId);
    }
}
