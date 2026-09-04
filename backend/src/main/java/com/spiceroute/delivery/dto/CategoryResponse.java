package com.spiceroute.delivery.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private String icon;
    private Boolean active;
    private Integer sortOrder;
    private Long itemCount;
}
