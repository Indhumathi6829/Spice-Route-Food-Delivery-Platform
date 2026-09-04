package com.spiceroute.delivery.repository;

import com.spiceroute.delivery.entity.AssignmentStatus;
import com.spiceroute.delivery.entity.DeliveryAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {

    Optional<DeliveryAssignment> findByOrderIdAndStatus(Long orderId, AssignmentStatus status);

    List<DeliveryAssignment> findByOrderId(Long orderId);

    List<DeliveryAssignment> findByPartnerId(Long partnerId);

    Optional<DeliveryAssignment> findByPartnerIdAndStatus(Long partnerId, AssignmentStatus status);

    /** Find PENDING assignments that have timed out — for the scheduler */
    @Query("""
        SELECT da FROM DeliveryAssignment da
        WHERE da.status = 'PENDING'
          AND da.offeredAt < :cutoff
        """)
    List<DeliveryAssignment> findTimedOutAssignments(LocalDateTime cutoff);

    /** Check if a partner already has an active accepted assignment */
    @Query("""
        SELECT COUNT(da) > 0 FROM DeliveryAssignment da
        WHERE da.partner.id = :partnerId
          AND da.status = 'ACCEPTED'
        """)
    boolean partnerHasActiveAssignment(Long partnerId);
}
