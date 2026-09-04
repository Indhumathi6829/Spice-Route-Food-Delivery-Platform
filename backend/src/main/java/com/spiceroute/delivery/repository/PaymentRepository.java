package com.spiceroute.delivery.repository;

import com.spiceroute.delivery.entity.Payment;
import com.spiceroute.delivery.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long orderId);
    Optional<Payment> findByGatewayOrderId(String gatewayOrderId);
    Optional<Payment> findByTransactionRef(String transactionRef);

    // ── AI Recovery additions (additive only) ────────────────────────────────
    List<Payment> findByStatus(PaymentStatus status);
    long countByStatus(PaymentStatus status);
}
