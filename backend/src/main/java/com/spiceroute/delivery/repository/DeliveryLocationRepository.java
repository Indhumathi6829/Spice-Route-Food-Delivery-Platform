package com.spiceroute.delivery.repository;

import com.spiceroute.delivery.entity.DeliveryLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface DeliveryLocationRepository extends JpaRepository<DeliveryLocation, Long> {

    /** Latest recorded location for a partner */
    Optional<DeliveryLocation> findTopByPartnerIdOrderByRecordedAtDesc(Long partnerId);

    /** Latest recorded location for an active order */
    Optional<DeliveryLocation> findTopByOrderIdOrderByRecordedAtDesc(Long orderId);

    /** Clean up old location entries — run nightly */
    @Modifying
    @Query("DELETE FROM DeliveryLocation dl WHERE dl.recordedAt < :cutoff")
    void deleteOlderThan(LocalDateTime cutoff);
}
