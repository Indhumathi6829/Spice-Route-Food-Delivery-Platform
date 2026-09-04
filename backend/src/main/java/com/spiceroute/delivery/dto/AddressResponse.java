package com.spiceroute.delivery.dto;

import com.spiceroute.delivery.entity.AddressType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddressResponse {
    private Long id;
    private String fullName;
    private String phone;
    private String houseNumber;
    private String street;
    private String area;
    private String city;
    private String state;
    private String postalCode;
    private Double latitude;
    private Double longitude;
    private AddressType addressType;
    private Boolean isDefault;
}
