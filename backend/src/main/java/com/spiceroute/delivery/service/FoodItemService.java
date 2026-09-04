package com.spiceroute.delivery.service;

import com.spiceroute.delivery.dto.FoodItemRequest;
import com.spiceroute.delivery.dto.FoodItemResponse;
import com.spiceroute.delivery.entity.Category;
import com.spiceroute.delivery.entity.FoodItem;
import com.spiceroute.delivery.exception.ResourceNotFoundException;
import com.spiceroute.delivery.repository.CategoryRepository;
import com.spiceroute.delivery.repository.FavoriteRepository;
import com.spiceroute.delivery.repository.FoodItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FoodItemService {

    private final FoodItemRepository foodItemRepository;
    private final CategoryRepository categoryRepository;
    private final FavoriteRepository favoriteRepository;

    public Page<FoodItemResponse> search(String q, Long categoryId, Boolean vegetarian,
                                         BigDecimal minPrice, BigDecimal maxPrice,
                                         String sortBy, String sortDir,
                                         int page, int size, Long currentUserId) {
        Sort sort = buildSort(sortBy, sortDir);
        Pageable pageable = PageRequest.of(page, size, sort);
        return foodItemRepository.search(
                (q != null && !q.isBlank()) ? q : null,
                categoryId, vegetarian, minPrice, maxPrice, pageable
        ).map(f -> toResponse(f, currentUserId));
    }

    public FoodItemResponse getById(Long id, Long currentUserId) {
        FoodItem item = findById(id);
        return toResponse(item, currentUserId);
    }

    @Cacheable("bestsellers")
    public List<FoodItemResponse> getBestsellers() {
        return foodItemRepository.findByBestsellerTrueAndAvailableTrue()
                .stream().map(f -> toResponse(f, null)).toList();
    }

    public List<FoodItemResponse> getByCategory(Long categoryId) {
        return foodItemRepository.findByCategoryIdAndAvailableTrue(categoryId)
                .stream().map(f -> toResponse(f, null)).toList();
    }

    public List<FoodItemResponse> getTopRated(int limit) {
        return foodItemRepository.findTopRated(PageRequest.of(0, limit))
                .stream().map(f -> toResponse(f, null)).toList();
    }

    public List<FoodItemResponse> getMostPopular(int limit) {
        return foodItemRepository.findMostPopular(PageRequest.of(0, limit))
                .stream().map(f -> toResponse(f, null)).toList();
    }

    @Transactional
    @CacheEvict(value = "bestsellers", allEntries = true)
    public FoodItemResponse create(FoodItemRequest req) {
        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", req.getCategoryId()));

        FoodItem item = FoodItem.builder()
                .category(category)
                .name(req.getName())
                .description(req.getDescription())
                .price(req.getPrice())
                .discountPrice(req.getDiscountPrice())
                .imageUrl(req.getImageUrl())
                .vegetarian(req.getVegetarian() != null ? req.getVegetarian() : true)
                .spicyLevel(req.getSpicyLevel())
                .preparationTime(req.getPreparationTime())
                .calories(req.getCalories())
                .available(req.getAvailable() != null ? req.getAvailable() : true)
                .bestseller(req.getBestseller() != null ? req.getBestseller() : false)
                .ingredients(req.getIngredients())
                .build();

        return toResponse(foodItemRepository.save(item), null);
    }

    @Transactional
    @CacheEvict(value = "bestsellers", allEntries = true)
    public FoodItemResponse update(Long id, FoodItemRequest req) {
        FoodItem item = findById(id);
        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", req.getCategoryId()));

        item.setCategory(category);
        item.setName(req.getName());
        item.setDescription(req.getDescription());
        item.setPrice(req.getPrice());
        item.setDiscountPrice(req.getDiscountPrice());
        if (req.getImageUrl() != null) item.setImageUrl(req.getImageUrl());
        if (req.getVegetarian() != null) item.setVegetarian(req.getVegetarian());
        if (req.getSpicyLevel() != null) item.setSpicyLevel(req.getSpicyLevel());
        if (req.getPreparationTime() != null) item.setPreparationTime(req.getPreparationTime());
        if (req.getCalories() != null) item.setCalories(req.getCalories());
        if (req.getAvailable() != null) item.setAvailable(req.getAvailable());
        if (req.getBestseller() != null) item.setBestseller(req.getBestseller());
        if (req.getIngredients() != null) item.setIngredients(req.getIngredients());

        return toResponse(foodItemRepository.save(item), null);
    }

    @Transactional
    @CacheEvict(value = "bestsellers", allEntries = true)
    public void delete(Long id) {
        FoodItem item = findById(id);
        foodItemRepository.delete(item);
    }

    @Transactional
    public FoodItemResponse toggleAvailability(Long id) {
        FoodItem item = findById(id);
        item.setAvailable(!item.getAvailable());
        return toResponse(foodItemRepository.save(item), null);
    }

    private FoodItem findById(Long id) {
        return foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FoodItem", id));
    }

    private Sort buildSort(String sortBy, String sortDir) {
        Sort.Direction dir = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String field = switch (sortBy != null ? sortBy : "rating") {
            case "price" -> "price";
            case "name" -> "name";
            case "popular" -> "totalRatings";
            case "newest" -> "createdAt";
            default -> "rating";
        };
        return Sort.by(dir, field);
    }

    public FoodItemResponse toResponse(FoodItem f, Long currentUserId) {
        return FoodItemResponse.builder()
                .id(f.getId())
                .categoryId(f.getCategory().getId())
                .categoryName(f.getCategory().getName())
                .name(f.getName())
                .description(f.getDescription())
                .price(f.getPrice())
                .discountPrice(f.getDiscountPrice())
                .effectivePrice(f.getEffectivePrice())
                .imageUrl(f.getImageUrl())
                .vegetarian(f.getVegetarian())
                .spicyLevel(f.getSpicyLevel())
                .preparationTime(f.getPreparationTime())
                .calories(f.getCalories())
                .rating(f.getRating())
                .totalRatings(f.getTotalRatings())
                .available(f.getAvailable())
                .bestseller(f.getBestseller())
                .ingredients(f.getIngredients())
                .isFavorite(currentUserId != null
                        ? favoriteRepository.existsByUserIdAndFoodItemId(currentUserId, f.getId())
                        : false)
                .createdAt(f.getCreatedAt())
                .build();
    }
}
