package com.spiceroute.delivery.service;

import com.spiceroute.delivery.dto.DeliveryPartnerResponse;
import com.spiceroute.delivery.dto.LocationUpdateRequest;
import com.spiceroute.delivery.entity.*;
import com.spiceroute.delivery.exception.BusinessException;
import com.spiceroute.delivery.exception.ResourceNotFoundException;
import com.spiceroute.delivery.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryPartnerService {

    private final DeliveryPartnerRepository partnerRepository;
    private final DeliveryLocationRepository locationRepository;
    private final UserRepository             userRepository;
    private final OrderRepository            orderRepository;
    private final SimpMessagingTemplate      messagingTemplate;

    /** Get or auto-create partner profile for a DELIVERY_PARTNER user */
    @Transactional
    public DeliveryPartner getOrCreateProfile(Long userId) {
        return partnerRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", userId));
            if (user.getRole() != Role.DELIVERY_PARTNER) {
                throw new BusinessException("User is not a delivery partner");
            }
            DeliveryPartner profile = DeliveryPartner.builder().user(user).build();
            return partnerRepository.save(profile);
        });
    }

    /** Go online — start accepting orders */
    @Transactional
    public DeliveryPartnerResponse goOnline(Long userId) {
        DeliveryPartner p = getOrCreateProfile(userId);
        p.setIsOnline(true);
        p.setIsAvailable(true);
        partnerRepository.save(p);
        log.info("Partner {} is now ONLINE", userId);
        return toResponse(p);
    }

    /** Go offline — stop accepting new orders */
    @Transactional
    public DeliveryPartnerResponse goOffline(Long userId) {
        DeliveryPartner p = getOrCreateProfile(userId);
        p.setIsOnline(false);
        partnerRepository.save(p);
        log.info("Partner {} is now OFFLINE", userId);
        return toResponse(p);
    }

    /** Update GPS location — called periodically from mobile app */
    @Transactional
    public void updateLocation(Long userId, LocationUpdateRequest req) {
        DeliveryPartner p = getOrCreateProfile(userId);
        p.setCurrentLatitude(req.getLatitude());
        p.setCurrentLongitude(req.getLongitude());
        p.setLastLocationUpdate(LocalDateTime.now());
        partnerRepository.save(p);

        // Persist location snapshot
        // Find active order if any
        Order activeOrder = orderRepository
                .findByDeliveryPartnerIdAndStatus(userId, OrderStatus.OUT_FOR_DELIVERY)
                .stream().findFirst().orElse(null);

        DeliveryLocation snapshot = DeliveryLocation.builder()
                .partner(p)
                .order(activeOrder)
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .speedKmh(req.getSpeedKmh())
                .headingDegrees(req.getHeadingDegrees())
                .recordedAt(LocalDateTime.now())
                .build();
        locationRepository.save(snapshot);

        // Broadcast via WebSocket so customer tracking page updates in real-time
        if (activeOrder != null) {
            Map<String, Object> payload = Map.of(
                    "orderId",   activeOrder.getId(),
                    "partnerId", userId,
                    "latitude",  req.getLatitude(),
                    "longitude", req.getLongitude(),
                    "timestamp", snapshot.getRecordedAt().toString()
            );
            messagingTemplate.convertAndSend("/topic/tracking/" + activeOrder.getId(), payload);
        }
    }

    public DeliveryPartnerResponse getProfile(Long userId) {
        DeliveryPartner p = getOrCreateProfile(userId);
        return toResponse(p);
    }

    public List<DeliveryPartnerResponse> getAllPartners() {
        return partnerRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<DeliveryPartnerResponse> getOnlinePartners() {
        return partnerRepository.findByIsOnlineTrueAndIsAvailableTrue()
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public DeliveryPartnerResponse updateProfile(Long userId, String vehicleType, String vehicleNumber) {
        DeliveryPartner p = getOrCreateProfile(userId);
        if (vehicleType != null)  p.setVehicleType(vehicleType);
        if (vehicleNumber != null) p.setVehicleNumber(vehicleNumber);
        return toResponse(partnerRepository.save(p));
    }

    public DeliveryPartnerResponse toResponse(DeliveryPartner p) {
        User u = p.getUser();
        return DeliveryPartnerResponse.builder()
                .id(p.getId())
                .userId(u.getId())
                .name(u.getName())
                .phone(u.getPhone())
                .profileImage(u.getProfileImage())
                .vehicleType(p.getVehicleType())
                .vehicleNumber(p.getVehicleNumber())
                .rating(p.getRating())
                .totalRatings(p.getTotalRatings())
                .isOnline(p.getIsOnline())
                .isAvailable(p.getIsAvailable())
                .currentLatitude(p.getCurrentLatitude())
                .currentLongitude(p.getCurrentLongitude())
                .lastLocationUpdate(p.getLastLocationUpdate())
                .totalDeliveries(p.getTotalDeliveries())
                .todayDeliveries(p.getTodayDeliveries())
                .build();
    }
}
