package com.spiceroute.delivery.repository;

import com.spiceroute.delivery.entity.FoodItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {

    Page<FoodItem> findByAvailableTrue(Pageable pageable);

    List<FoodItem> findByCategoryIdAndAvailableTrue(Long categoryId);

    List<FoodItem> findByBestsellerTrueAndAvailableTrue();

    @Query("""
            SELECT f FROM FoodItem f
            WHERE f.available = true
            AND (:q IS NULL OR LOWER(f.name) LIKE LOWER(CONCAT('%',:q,'%'))
                          OR LOWER(f.description) LIKE LOWER(CONCAT('%',:q,'%')))
            AND (:categoryId IS NULL OR f.category.id = :categoryId)
            AND (:vegetarian IS NULL OR f.vegetarian = :vegetarian)
            AND (:minPrice IS NULL OR f.price >= :minPrice)
            AND (:maxPrice IS NULL OR f.price <= :maxPrice)
            """)
    Page<FoodItem> search(String q, Long categoryId, Boolean vegetarian,
                          BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    @Query("SELECT f FROM FoodItem f WHERE f.available = true ORDER BY f.rating DESC")
    List<FoodItem> findTopRated(Pageable pageable);

    @Query("SELECT f FROM FoodItem f WHERE f.available = true ORDER BY f.totalRatings DESC")
    List<FoodItem> findMostPopular(Pageable pageable);
}
