package com.spiceroute.delivery.repository;

import com.spiceroute.delivery.entity.Order;
import com.spiceroute.delivery.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByCustomerIdOrderByPlacedAtDesc(Long customerId, Pageable pageable);

    List<Order> findByStatusIn(List<OrderStatus> statuses);

    List<Order> findByDeliveryPartnerId(Long partnerId);

    List<Order> findByDeliveryPartnerIdAndStatus(Long partnerId, OrderStatus status);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status NOT IN ('DELIVERED','CANCELLED')")
    Long countActiveOrders();

    @Query("SELECT COUNT(o) FROM Order o WHERE DATE(o.placedAt) = CURRENT_DATE")
    Long countTodaysOrders();

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'DELIVERED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'DELIVERED' AND DATE(o.deliveredAt) = CURRENT_DATE")
    BigDecimal getTodaysRevenue();

    @Query("SELECT COUNT(DISTINCT o.customer.id) FROM Order o")
    Long countTotalCustomers();

    @Query("SELECT o FROM Order o WHERE o.placedAt BETWEEN :from AND :to ORDER BY o.placedAt DESC")
    List<Order> findByDateRange(LocalDateTime from, LocalDateTime to);

    @Query("""
            SELECT oi.foodItem.name, SUM(oi.quantity) as qty
            FROM OrderItem oi
            GROUP BY oi.foodItem.id, oi.foodItem.name
            ORDER BY qty DESC
            """)
    List<Object[]> findTopFoodItems(Pageable pageable);
}
