package com.spiceroute.delivery.dto;

import com.spiceroute.delivery.entity.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String profileImage;
    private Role role;
    private String token;
    private String refreshToken;
}
