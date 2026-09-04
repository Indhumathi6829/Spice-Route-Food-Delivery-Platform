package com.spiceroute.delivery.repository;

import com.spiceroute.delivery.entity.RecoveryAttempt;
import com.spiceroute.delivery.entity.RecoveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecoveryAttemptRepository extends JpaRepository<RecoveryAttempt, Long> {

    Optional<RecoveryAttempt> findByOrderId(Long orderId);

    List<RecoveryAttempt> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<RecoveryAttempt> findByStatusOrderByCreatedAtDesc(RecoveryStatus status);

    List<RecoveryAttempt> findByStatus(RecoveryStatus status);

    boolean existsByOrderId(Long orderId);

    Optional<RecoveryAttempt> findByRecoveryGatewayOrderId(String gatewayOrderId);

    // ── Dashboard metrics ────────────────────────────────────────────────────

    @Query("SELECT COUNT(r) FROM RecoveryAttempt r WHERE r.status = 'RECOVERED'")
    long countRecovered();

    @Query("SELECT COUNT(r) FROM RecoveryAttempt r WHERE r.status NOT IN ('PENDING')")
    long countEligibleAttempts();

    @Query("SELECT COUNT(r) FROM RecoveryAttempt r")
    long countAllAttempts();

    @Query("SELECT COUNT(r) FROM RecoveryAttempt r WHERE r.status = 'IN_PROGRESS'")
    long countInProgress();

    @Query("SELECT COUNT(r) FROM RecoveryAttempt r WHERE r.status = 'PENDING'")
    long countPending();

    @Query("SELECT COUNT(r) FROM RecoveryAttempt r WHERE r.status = 'FAILED'")
    long countFailed();

    @Query("SELECT COUNT(r) FROM RecoveryAttempt r WHERE r.status = 'CANCELLED'")
    long countCancelled();

    @Query("SELECT COALESCE(SUM(r.recoveryAmount), 0) FROM RecoveryAttempt r WHERE r.status = 'RECOVERED'")
    BigDecimal sumRecoveredAmount();

    @Query("SELECT COALESCE(SUM(r.recoveryAmount), 0) FROM RecoveryAttempt r")
    BigDecimal sumPotentialAmount();

    @Query("SELECT r FROM RecoveryAttempt r ORDER BY r.createdAt DESC")
    List<RecoveryAttempt> findAllOrderByCreatedAtDesc();

    /** Stale PENDING/IN_PROGRESS attempts older than the given cutoff — for expiry job */
    @Query("SELECT r FROM RecoveryAttempt r WHERE r.status IN ('PENDING','IN_PROGRESS') AND r.createdAt < :cutoff")
    List<RecoveryAttempt> findExpiredAttempts(LocalDateTime cutoff);
}
