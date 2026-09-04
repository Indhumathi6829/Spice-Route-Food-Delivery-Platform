package com.spiceroute.delivery.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class AnalyticsResponse {
    private BigDecimal totalRevenue;
    private BigDecimal todaysRevenue;
    private Long totalOrders;
    private Long todaysOrders;
    private Long totalCustomers;
    private Long activeOrders;
    private Long pendingOrders;
    private Long totalDeliveryPartners;
    private Long onlineDeliveryPartners;
    private Long awaitingPartner;
    private Double averageRating;
    private Double averageDeliveryRating;
    private List<Map<String, Object>> revenueByDay;
    private List<Map<String, Object>> ordersByStatus;
    private List<Map<String, Object>> topFoodItems;
    private List<Map<String, Object>> ordersByCategory;
}
