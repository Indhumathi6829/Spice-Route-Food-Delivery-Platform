package com.spiceroute.delivery.dto;

import com.spiceroute.delivery.entity.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian phone number")
    private String phone;

    // Defaults to CUSTOMER — frontend sends the chosen role explicitly.
    private Role role = Role.CUSTOMER;

    /**
     * Only required when role is RESTAURANT_ADMIN or SUPER_ADMIN.
     * Must match the server-side ADMIN_REGISTRATION_CODE env variable.
     * Never stored or logged.
     */
    private String adminCode;
}
