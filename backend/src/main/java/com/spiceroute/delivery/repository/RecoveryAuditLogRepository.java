package com.spiceroute.delivery.repository;

import com.spiceroute.delivery.entity.RecoveryAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecoveryAuditLogRepository extends JpaRepository<RecoveryAuditLog, Long> {

    List<RecoveryAuditLog> findByAttemptIdOrderByTimestampAsc(Long attemptId);

    List<RecoveryAuditLog> findByOrderIdOrderByTimestampAsc(Long orderId);
}
