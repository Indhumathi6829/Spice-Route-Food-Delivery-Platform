package com.spiceroute.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank private String name;
    private String description;
    private String imageUrl;
    private String icon;
    private Integer sortOrder;
    private Boolean active = true;
}
