package com.spiceroute.delivery.repository;

import com.spiceroute.delivery.entity.DeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceTokenRepository extends JpaRepository<DeviceToken, Long> {

    List<DeviceToken> findByUserIdAndActiveTrue(Long userId);

    Optional<DeviceToken> findByToken(String token);

    @Modifying
    @Query("UPDATE DeviceToken dt SET dt.active = false WHERE dt.token = :token")
    void deactivateToken(String token);

    @Modifying
    @Query("DELETE FROM DeviceToken dt WHERE dt.user.id = :userId AND dt.platform = :platform")
    void deleteByUserIdAndPlatform(Long userId, String platform);
}
