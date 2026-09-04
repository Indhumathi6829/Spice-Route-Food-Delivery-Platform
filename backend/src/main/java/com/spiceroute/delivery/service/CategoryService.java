package com.spiceroute.delivery.service;

import com.spiceroute.delivery.dto.CategoryRequest;
import com.spiceroute.delivery.dto.CategoryResponse;
import com.spiceroute.delivery.entity.Category;
import com.spiceroute.delivery.exception.BusinessException;
import com.spiceroute.delivery.exception.ResourceNotFoundException;
import com.spiceroute.delivery.repository.CategoryRepository;
import com.spiceroute.delivery.repository.FoodItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final FoodItemRepository foodItemRepository;

    public List<CategoryResponse> getAllActive() {
        return categoryRepository.findAllByOrderBySortOrderAsc()
                .stream()
                .filter(c -> c.getActive())
                .map(this::toResponse)
                .toList();
    }

    public List<CategoryResponse> getAll() {
        return categoryRepository.findAllByOrderBySortOrderAsc()
                .stream().map(this::toResponse).toList();
    }

    public CategoryResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest req) {
        if (categoryRepository.findByNameIgnoreCase(req.getName()).isPresent()) {
            throw new BusinessException("Category '" + req.getName() + "' already exists");
        }
        Category cat = Category.builder()
                .name(req.getName())
                .description(req.getDescription())
                .imageUrl(req.getImageUrl())
                .icon(req.getIcon())
                .sortOrder(req.getSortOrder())
                .active(req.getActive() != null ? req.getActive() : true)
                .build();
        return toResponse(categoryRepository.save(cat));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest req) {
        Category cat = findById(id);
        cat.setName(req.getName());
        cat.setDescription(req.getDescription());
        if (req.getImageUrl() != null) cat.setImageUrl(req.getImageUrl());
        if (req.getIcon() != null) cat.setIcon(req.getIcon());
        if (req.getSortOrder() != null) cat.setSortOrder(req.getSortOrder());
        if (req.getActive() != null) cat.setActive(req.getActive());
        return toResponse(categoryRepository.save(cat));
    }

    @Transactional
    public void delete(Long id) {
        Category cat = findById(id);
        if (!cat.getFoodItems().isEmpty()) {
            throw new BusinessException("Cannot delete category with existing food items. Remove items first.");
        }
        categoryRepository.delete(cat);
    }

    @Transactional
    public CategoryResponse toggleActive(Long id) {
        Category cat = findById(id);
        cat.setActive(!cat.getActive());
        return toResponse(categoryRepository.save(cat));
    }

    private Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
    }

    private CategoryResponse toResponse(Category cat) {
        return CategoryResponse.builder()
                .id(cat.getId())
                .name(cat.getName())
                .description(cat.getDescription())
                .imageUrl(cat.getImageUrl())
                .icon(cat.getIcon())
                .active(cat.getActive())
                .sortOrder(cat.getSortOrder())
                .itemCount((long) cat.getFoodItems().size())
                .build();
    }
}
