package com.spiceroute.delivery.repository;

import com.spiceroute.delivery.entity.DeliveryPartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryPartnerRepository extends JpaRepository<DeliveryPartner, Long> {

    Optional<DeliveryPartner> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    List<DeliveryPartner> findByIsOnlineTrueAndIsAvailableTrue();

    /** Find available partners within a bounding box for quick pre-filter, then score in-memory */
    @Query("""
        SELECT dp FROM DeliveryPartner dp
        WHERE dp.isOnline = true
          AND dp.isAvailable = true
          AND dp.currentLatitude  BETWEEN :minLat AND :maxLat
          AND dp.currentLongitude BETWEEN :minLon AND :maxLon
          AND dp.currentLatitude  IS NOT NULL
          AND dp.currentLongitude IS NOT NULL
        """)
    List<DeliveryPartner> findAvailableInBoundingBox(
            double minLat, double maxLat, double minLon, double maxLon);
}
