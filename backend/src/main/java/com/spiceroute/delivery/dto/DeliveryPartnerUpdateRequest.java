package com.spiceroute.delivery.dto;

import lombok.Data;

@Data
public class DeliveryPartnerUpdateRequest {
    private String vehicleType;
    private String vehicleNumber;
}
