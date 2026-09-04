package com.spiceroute.delivery.repository;

import com.spiceroute.delivery.entity.FestivalOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FestivalOfferRepository extends JpaRepository<FestivalOffer, Long> {

    /** All currently active & live offers (active=true AND within date range) */
    @Query("SELECT f FROM FestivalOffer f WHERE f.active = true AND f.startDate <= :now AND f.endDate >= :now")
    List<FestivalOffer> findCurrentlyActive(LocalDateTime now);

    /** All offers admin sees (ordered newest first) */
    List<FestivalOffer> findAllByOrderByCreatedAtDesc();

    Optional<FestivalOffer> findByCouponCode(String couponCode);
}
