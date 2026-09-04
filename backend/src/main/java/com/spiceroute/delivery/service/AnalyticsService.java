package com.spiceroute.delivery.service;

import com.spiceroute.delivery.dto.AnalyticsResponse;
import com.spiceroute.delivery.entity.OrderStatus;
import com.spiceroute.delivery.repository.DeliveryPartnerRepository;
import com.spiceroute.delivery.repository.OrderRepository;
import com.spiceroute.delivery.repository.ReviewRepository;
import com.spiceroute.delivery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository           orderRepository;
    private final UserRepository            userRepository;
    private final ReviewRepository          reviewRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;

    public AnalyticsResponse getDashboard() {
        BigDecimal totalRevenue  = nullSafe(orderRepository.getTotalRevenue());
        BigDecimal todaysRevenue = nullSafe(orderRepository.getTodaysRevenue());
        Long totalOrders    = orderRepository.count();
        Long todaysOrders   = orderRepository.countTodaysOrders();
        Long totalCustomers = orderRepository.countTotalCustomers();
        Long activeOrders   = orderRepository.countActiveOrders();

        // ── Delivery partner counts — from DeliveryPartner table ──────────────
        long totalPartners  = deliveryPartnerRepository.count();
        long onlinePartners = deliveryPartnerRepository.findByIsOnlineTrueAndIsAvailableTrue().size();

        // Top 5 food items
        List<Map<String, Object>> topItems = orderRepository.findTopFoodItems(PageRequest.of(0, 5))
                .stream().map(row -> Map.<String, Object>of("name", row[0], "quantity", row[1]))
                .collect(Collectors.toList());

        // Orders by status
        List<Map<String, Object>> byStatus = Arrays.stream(OrderStatus.values())
                .map(s -> {
                    long count = orderRepository.findByStatusIn(List.of(s)).size();
                    return Map.<String, Object>of("status", s.name(), "count", count);
                }).collect(Collectors.toList());

        // Revenue last 7 days (simple)
        List<Map<String, Object>> revenueByDay = orderRepository
                .findByDateRange(LocalDateTime.now().minusDays(7), LocalDateTime.now())
                .stream()
                .collect(Collectors.groupingBy(
                        o -> o.getPlacedAt().toLocalDate().toString(),
                        Collectors.reducing(BigDecimal.ZERO,
                                o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO,
                                BigDecimal::add)))
                .entrySet().stream()
                .map(e -> Map.<String, Object>of("date", e.getKey(), "revenue", e.getValue()))
                .sorted((a, b) -> a.get("date").toString().compareTo(b.get("date").toString()))
                .collect(Collectors.toList());

        Double avgRating         = reviewRepository.getAverageRating();
        Double avgDeliveryRating = reviewRepository.getAverageDeliveryRatingOverall();

        // Orders awaiting a partner (placed/confirmed but not yet assigned)
        long awaitingPartner = orderRepository
                .findByStatusIn(List.of(OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.READY_FOR_PICKUP))
                .stream()
                .filter(o -> o.getDeliveryPartner() == null)
                .count();

        return AnalyticsResponse.builder()
                .totalRevenue(totalRevenue)
                .todaysRevenue(todaysRevenue)
                .totalOrders(totalOrders)
                .todaysOrders(todaysOrders)
                .totalCustomers(totalCustomers)
                .activeOrders(activeOrders)
                .pendingOrders(orderRepository.findByStatusIn(List.of(OrderStatus.PLACED)).stream().count())
                .totalDeliveryPartners(totalPartners)
                .onlineDeliveryPartners(onlinePartners)
                .awaitingPartner(awaitingPartner)
                .averageRating(avgRating)
                .averageDeliveryRating(avgDeliveryRating)
                .revenueByDay(revenueByDay)
                .ordersByStatus(byStatus)
                .topFoodItems(topItems)
                .build();
    }

    private BigDecimal nullSafe(BigDecimal val) {
        return val != null ? val : BigDecimal.ZERO;
    }
}
