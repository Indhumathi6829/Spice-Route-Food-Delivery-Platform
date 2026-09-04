package com.spiceroute.delivery.repository;

import com.spiceroute.delivery.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserId(Long userId);
    Optional<Favorite> findByUserIdAndFoodItemId(Long userId, Long foodItemId);
    boolean existsByUserIdAndFoodItemId(Long userId, Long foodItemId);
    void deleteByUserIdAndFoodItemId(Long userId, Long foodItemId);
}
