package com.spiceroute.delivery.service;

import com.spiceroute.delivery.dto.ReviewRequest;
import com.spiceroute.delivery.dto.ReviewResponse;
import com.spiceroute.delivery.entity.*;
import com.spiceroute.delivery.exception.BusinessException;
import com.spiceroute.delivery.exception.ResourceNotFoundException;
import com.spiceroute.delivery.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository          reviewRepository;
    private final OrderRepository           orderRepository;
    private final FoodItemRepository        foodItemRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;

    // ── Public feed ───────────────────────────────────────────────────────────

    public Page<ReviewResponse> getPublicReviews(int page, int size) {
        return reviewRepository.findByApprovedTrueOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(this::toResponse);
    }

    // ── Reviews for a specific food item (public) ─────────────────────────────

    public Page<ReviewResponse> getByFoodItem(Long foodItemId, int page, int size) {
        return reviewRepository.findByFoodItemId(foodItemId, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    // ── Reviews for a delivery partner ────────────────────────────────────────

    public Page<ReviewResponse> getDeliveryPartnerReviews(Long partnerUserId, int page, int size) {
        return reviewRepository.findDeliveryReviewsForPartner(partnerUserId, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    public Map<String, Object> getDeliveryPartnerStats(Long partnerUserId) {
        Double avg   = reviewRepository.getAverageDeliveryRatingForPartner(partnerUserId);
        Long   count = reviewRepository.countDeliveryReviewsForPartner(partnerUserId);
        List<Object[]> dist = reviewRepository.getDeliveryRatingDistribution(partnerUserId);

        Map<Integer, Long> distribution = new java.util.LinkedHashMap<>();
        for (int i = 5; i >= 1; i--) distribution.put(i, 0L);
        for (Object[] row : dist) {
            Integer star = (Integer) row[0];
            Long    cnt  = (Long) row[1];
            distribution.put(star, cnt);
        }

        return Map.of(
            "averageRating",     avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0,
            "totalReviews",      count != null ? count : 0L,
            "ratingDistribution", distribution
        );
    }

    // ── Customer's own reviews ─────────────────────────────────────────────────

    public Page<ReviewResponse> getMyReviews(Long customerId, int page, int size) {
        return reviewRepository.findByCustomerIdOrderByCreatedAtDesc(customerId, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    // ── Admin: all reviews ────────────────────────────────────────────────────

    public Page<ReviewResponse> getAllReviews(int page, int size) {
        return reviewRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(this::toResponse);
    }

    // ── Get review for a specific order (by the authenticated customer) ───────

    public Optional<ReviewResponse> getByOrderId(Long orderId, Long customerId) {
        return reviewRepository.findByOrderId(orderId).map(r -> {
            if (!r.getCustomer().getId().equals(customerId)) {
                throw new BusinessException("Access denied");
            }
            return toResponse(r);
        });
    }

    // ── Create ────────────────────────────────────────────────────────────────

    @Transactional
    public ReviewResponse create(Long customerId, ReviewRequest req) {
        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", req.getOrderId()));

        if (!order.getCustomer().getId().equals(customerId)) {
            throw new BusinessException("You can only review your own orders");
        }
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new BusinessException("You can only review delivered orders");
        }
        if (reviewRepository.existsByOrderId(req.getOrderId())) {
            throw new BusinessException("You have already reviewed this order");
        }

        Review review = Review.builder()
                .order(order)
                .customer(order.getCustomer())
                .foodRating(req.getFoodRating())
                .deliveryRating(req.getDeliveryRating())
                .comment(req.getComment())
                .build();

        reviewRepository.save(review);

        // Recalculate running average on every food item in the order
        order.getItems().forEach(oi -> updateFoodRating(oi.getFoodItem(), req.getFoodRating()));

        // Update delivery partner rating if provided
        if (req.getDeliveryRating() != null && order.getDeliveryPartner() != null) {
            updateDeliveryPartnerRating(order.getDeliveryPartner().getId(), req.getDeliveryRating());
        }

        return toResponse(review);
    }

    // ── Update (customer may edit their own review) ───────────────────────────

    @Transactional
    public ReviewResponse update(Long reviewId, Long customerId, ReviewRequest req) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        if (!review.getCustomer().getId().equals(customerId)) {
            throw new BusinessException("You can only edit your own review");
        }

        int oldFoodRating         = review.getFoodRating();
        Integer oldDeliveryRating = review.getDeliveryRating();

        review.setFoodRating(req.getFoodRating());
        if (req.getDeliveryRating() != null) {
            review.setDeliveryRating(req.getDeliveryRating());
        }
        if (req.getComment() != null) {
            review.setComment(req.getComment());
        }
        reviewRepository.save(review);

        // Adjust food item ratings: roll back old, apply new
        review.getOrder().getItems().forEach(oi -> {
            FoodItem food = oi.getFoodItem();
            int total     = food.getTotalRatings();
            if (total > 0) {
                double currentSum = food.getRating().doubleValue() * total;
                double newAvg     = (currentSum - oldFoodRating + req.getFoodRating()) / total;
                food.setRating(BigDecimal.valueOf(newAvg).setScale(2, RoundingMode.HALF_UP));
                foodItemRepository.save(food);
            }
        });

        // Adjust delivery partner rating if changed
        if (req.getDeliveryRating() != null && review.getOrder().getDeliveryPartner() != null) {
            Long dpUserId = review.getOrder().getDeliveryPartner().getId();
            deliveryPartnerRepository.findByUserId(dpUserId).ifPresent(dp -> {
                int total = dp.getTotalRatings();
                if (total > 0 && oldDeliveryRating != null) {
                    double currentSum = dp.getRating().doubleValue() * total;
                    double newAvg = (currentSum - oldDeliveryRating + req.getDeliveryRating()) / total;
                    dp.setRating(BigDecimal.valueOf(newAvg).setScale(2, RoundingMode.HALF_UP));
                    deliveryPartnerRepository.save(dp);
                }
            });
        }

        return toResponse(review);
    }

    // ── Delete (customer may delete their own review) ─────────────────────────

    @Transactional
    public void delete(Long reviewId, Long customerId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        if (!review.getCustomer().getId().equals(customerId)) {
            throw new BusinessException("You can only delete your own review");
        }

        // Roll back the food-item rating contribution
        int rating = review.getFoodRating();
        review.getOrder().getItems().forEach(oi -> {
            FoodItem food = oi.getFoodItem();
            int total     = food.getTotalRatings();
            if (total > 1) {
                double newAvg = (food.getRating().doubleValue() * total - rating) / (total - 1);
                food.setRating(BigDecimal.valueOf(newAvg).setScale(2, RoundingMode.HALF_UP));
                food.setTotalRatings(total - 1);
            } else {
                food.setRating(BigDecimal.ZERO);
                food.setTotalRatings(0);
            }
            foodItemRepository.save(food);
        });

        // Roll back delivery partner rating if present
        if (review.getDeliveryRating() != null && review.getOrder().getDeliveryPartner() != null) {
            Long dpUserId = review.getOrder().getDeliveryPartner().getId();
            deliveryPartnerRepository.findByUserId(dpUserId).ifPresent(dp -> {
                int total   = dp.getTotalRatings();
                int dRating = review.getDeliveryRating();
                if (total > 1) {
                    double newAvg = (dp.getRating().doubleValue() * total - dRating) / (total - 1);
                    dp.setRating(BigDecimal.valueOf(newAvg).setScale(2, RoundingMode.HALF_UP));
                    dp.setTotalRatings(total - 1);
                } else {
                    dp.setRating(BigDecimal.valueOf(5.0));
                    dp.setTotalRatings(0);
                }
                deliveryPartnerRepository.save(dp);
            });
        }

        reviewRepository.delete(review);
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    @Transactional
    public void toggleApproval(Long reviewId) {
        Review r = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));
        r.setApproved(!r.getApproved());
        reviewRepository.save(r);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void updateFoodRating(FoodItem food, int newRating) {
        int newTotal = food.getTotalRatings() + 1;
        BigDecimal newAvg = BigDecimal.valueOf(
                food.getRating().doubleValue() * (newTotal - 1) + newRating)
                .divide(BigDecimal.valueOf(newTotal), 2, RoundingMode.HALF_UP);
        food.setRating(newAvg);
        food.setTotalRatings(newTotal);
        foodItemRepository.save(food);
    }

    private void updateDeliveryPartnerRating(Long deliveryPartnerUserId, int newRating) {
        deliveryPartnerRepository.findByUserId(deliveryPartnerUserId).ifPresent(dp -> {
            int newTotal = dp.getTotalRatings() + 1;
            BigDecimal newAvg = BigDecimal.valueOf(
                    dp.getRating().doubleValue() * (newTotal - 1) + newRating)
                    .divide(BigDecimal.valueOf(newTotal), 2, RoundingMode.HALF_UP);
            dp.setRating(newAvg);
            dp.setTotalRatings(newTotal);
            deliveryPartnerRepository.save(dp);
        });
    }

    public ReviewResponse toResponse(Review r) {
        String deliveryPartnerName = null;
        try {
            User dp = r.getOrder().getDeliveryPartner();
            if (dp != null) deliveryPartnerName = dp.getName();
        } catch (Exception ignored) {}

        return ReviewResponse.builder()
                .id(r.getId())
                .orderId(r.getOrder().getId())
                .customerId(r.getCustomer().getId())
                .customerName(r.getCustomer().getName())
                .customerProfileImage(r.getCustomer().getProfileImage())
                .foodRating(r.getFoodRating())
                .deliveryRating(r.getDeliveryRating())
                .deliveryPartnerName(deliveryPartnerName)
                .comment(r.getComment())
                .approved(r.getApproved())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
