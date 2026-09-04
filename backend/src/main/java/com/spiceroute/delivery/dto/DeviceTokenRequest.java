package com.spiceroute.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DeviceTokenRequest {
    @NotBlank private String token;
    @NotBlank private String platform; // ANDROID, IOS, WEB
}
