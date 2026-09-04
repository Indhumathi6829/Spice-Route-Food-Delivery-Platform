package com.spiceroute.delivery.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class DeliveryPartnerResponse {
    private Long id;
    private Long userId;
    private String name;
    private String phone;
    private String profileImage;
    private String vehicleType;
    private String vehicleNumber;
    private BigDecimal rating;
    private Integer totalRatings;
    private Boolean isOnline;
    private Boolean isAvailable;
    private Double currentLatitude;
    private Double currentLongitude;
    private LocalDateTime lastLocationUpdate;
    private Integer totalDeliveries;
    private Integer todayDeliveries;
    /** Populated by getNearbyPartners — distance from a reference point */
    private Double distanceKm;
}
