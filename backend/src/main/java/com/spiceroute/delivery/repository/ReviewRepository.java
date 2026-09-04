package com.spiceroute.delivery.repository;

import com.spiceroute.delivery.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByOrderId(Long orderId);
    boolean existsByOrderId(Long orderId);
    Page<Review> findByApprovedTrueOrderByCreatedAtDesc(Pageable pageable);

    /** All reviews written by a specific customer */
    List<Review> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    @Query("SELECT AVG(r.foodRating) FROM Review r WHERE r.approved = true")
    Double getAverageRating();

    @Query("SELECT AVG(r.deliveryRating) FROM Review r WHERE r.deliveryRating IS NOT NULL AND r.approved = true")
    Double getAverageDeliveryRatingOverall();

    /**
     * Average delivery rating for a specific delivery partner
     * (joins through Order → deliveryPartner)
     */
    @Query("""
        SELECT AVG(r.deliveryRating)
        FROM Review r
        WHERE r.deliveryRating IS NOT NULL
          AND r.order.deliveryPartner.id = :partnerUserId
          AND r.approved = true
        """)
    Double getAverageDeliveryRatingForPartner(Long partnerUserId);

    /**
     * Total delivery reviews for a specific partner
     */
    @Query("""
        SELECT COUNT(r)
        FROM Review r
        WHERE r.deliveryRating IS NOT NULL
          AND r.order.deliveryPartner.id = :partnerUserId
          AND r.approved = true
        """)
    Long countDeliveryReviewsForPartner(Long partnerUserId);

    /**
     * Approved reviews for a specific food item (via order items)
     */
    @Query("""
        SELECT DISTINCT r FROM Review r
        JOIN r.order o
        JOIN o.items oi
        WHERE oi.foodItem.id = :foodItemId
          AND r.approved = true
        ORDER BY r.createdAt DESC
        """)
    Page<Review> findByFoodItemId(Long foodItemId, Pageable pageable);

    /**
     * All approved delivery reviews for a specific partner user ID
     */
    @Query("""
        SELECT r FROM Review r
        WHERE r.deliveryRating IS NOT NULL
          AND r.order.deliveryPartner.id = :partnerUserId
          AND r.approved = true
        ORDER BY r.createdAt DESC
        """)
    Page<Review> findDeliveryReviewsForPartner(Long partnerUserId, Pageable pageable);

    /**
     * Customer's own reviews
     */
    Page<Review> findByCustomerIdOrderByCreatedAtDesc(Long customerId, Pageable pageable);

    /**
     * Count of approved reviews for a specific food item
     */
    @Query("""
        SELECT COUNT(DISTINCT r) FROM Review r
        JOIN r.order o
        JOIN o.items oi
        WHERE oi.foodItem.id = :foodItemId
          AND r.approved = true
        """)
    Long countByFoodItemId(Long foodItemId);

    /**
     * Rating distribution for delivery partner (1–5 star counts)
     */
    @Query("""
        SELECT r.deliveryRating, COUNT(r)
        FROM Review r
        WHERE r.deliveryRating IS NOT NULL
          AND r.order.deliveryPartner.id = :partnerUserId
          AND r.approved = true
        GROUP BY r.deliveryRating
        ORDER BY r.deliveryRating DESC
        """)
    List<Object[]> getDeliveryRatingDistribution(Long partnerUserId);

    /** All reviews for admin (paginated) */
    Page<Review> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
