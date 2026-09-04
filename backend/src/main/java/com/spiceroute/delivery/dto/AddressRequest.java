package com.spiceroute.delivery.dto;

import com.spiceroute.delivery.entity.AddressType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddressRequest {
    private String fullName;
    private String phone;
    @NotBlank private String houseNumber;
    @NotBlank private String street;
    private String area;
    @NotBlank private String city;
    @NotBlank private String state;
    @NotBlank private String postalCode;
    private Double latitude;
    private Double longitude;
    private AddressType addressType = AddressType.HOME;
    private Boolean isDefault = false;
}
