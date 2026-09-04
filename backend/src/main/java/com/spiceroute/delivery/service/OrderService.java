package com.spiceroute.delivery.service;

import com.spiceroute.delivery.domain.OrderStateMachine;
import com.spiceroute.delivery.dto.*;
import com.spiceroute.delivery.entity.*;
import com.spiceroute.delivery.exception.BusinessException;
import com.spiceroute.delivery.exception.ResourceNotFoundException;
import com.spiceroute.delivery.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private static final BigDecimal DELIVERY_FEE = BigDecimal.valueOf(49);
    private static final BigDecimal TAX_RATE     = BigDecimal.valueOf(0.05);

    private final OrderRepository           orderRepository;
    private final FoodItemRepository        foodItemRepository;
    private final AddressRepository         addressRepository;
    private final UserRepository            userRepository;
    private final CouponRepository          couponRepository;
    private final SimpMessagingTemplate     messagingTemplate;
    private final OrderStateMachine         stateMachine;
    private final CartService               cartService;
    private final NotificationService       notificationService;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    // Injected lazily via setter to break circular dependency
    private DeliveryAssignmentService deliveryAssignmentService;

    @org.springframework.beans.factory.annotation.Autowired
    public void setDeliveryAssignmentService(DeliveryAssignmentService deliveryAssignmentService) {
        this.deliveryAssignmentService = deliveryAssignmentService;
    }

    @Transactional
    public OrderResponse placeOrder(Long customerId, PlaceOrderRequest req) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", customerId));

        Address address = addressRepository.findById(req.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address", req.getAddressId()));

        if (!address.getUser().getId().equals(customerId)) {
            throw new AccessDeniedException("Address does not belong to this user");
        }

        Order order = Order.builder()
                .customer(customer)
                .deliveryAddress(address)
                .specialInstructions(req.getSpecialInstructions())
                .paymentMethod(req.getPaymentMethod())
                .build();

        // Compute items (prices always from DB – never trust frontend)
        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItemRequest itemReq : req.getItems()) {
            FoodItem food = foodItemRepository.findById(itemReq.getFoodItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("FoodItem", itemReq.getFoodItemId()));
            if (!food.getAvailable()) {
                throw new BusinessException("'" + food.getName() + "' is currently not available");
            }
            BigDecimal unitPrice = food.getEffectivePrice();
            OrderItem oi = OrderItem.builder()
                    .order(order)
                    .foodItem(food)
                    .quantity(itemReq.getQuantity())
                    .priceAtOrderTime(unitPrice)
                    .customizations(itemReq.getCustomizations())
                    .build();
            order.getItems().add(oi);
            subtotal = subtotal.add(unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity())));
        }

        // Apply coupon
        BigDecimal discount = BigDecimal.ZERO;
        if (req.getCouponCode() != null && !req.getCouponCode().isBlank()) {
            Coupon coupon = couponRepository.findByCodeIgnoreCase(req.getCouponCode())
                    .orElseThrow(() -> new BusinessException("Invalid coupon code"));
            if (!coupon.isValid()) throw new BusinessException("Coupon is expired or exhausted");
            if (coupon.getMinimumOrderValue() != null && subtotal.compareTo(coupon.getMinimumOrderValue()) < 0)
                throw new BusinessException("Minimum order ₹" + coupon.getMinimumOrderValue() + " required");
            discount = coupon.calculateDiscount(subtotal);
            coupon.setUsageCount(coupon.getUsageCount() + 1);
            order.setCouponCode(req.getCouponCode().toUpperCase());
        }

        BigDecimal tax   = subtotal.subtract(discount).multiply(TAX_RATE);
        BigDecimal total = subtotal.add(DELIVERY_FEE).add(tax).subtract(discount);

        order.setSubtotal(subtotal);
        order.setDeliveryFee(DELIVERY_FEE);
        order.setTax(tax);
        order.setDiscountAmount(discount);
        order.setTotalAmount(total);

        // Status history
        OrderStatusHistory hist = OrderStatusHistory.builder()
                .order(order).status(OrderStatus.PLACED).note("Order placed").build();
        order.getStatusHistory().add(hist);

        Order saved = orderRepository.save(order);

        // Clear cart
        try { cartService.clearCart(customerId); } catch (Exception ignored) {}

        // Notify customer
        notificationService.send(customerId,
                "Order Placed!", "Your order #" + saved.getId() + " has been placed successfully.",
                NotificationType.ORDER_UPDATE, saved.getId());

        broadcastStatus(saved);
        log.info("Order {} placed by customer {}", saved.getId(), customerId);
        return toResponse(saved);
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, OrderStatus newStatus, User actor) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        OrderStatus current = order.getStatus();
        stateMachine.validate(current, newStatus, actor.getRole());

        order.setStatus(newStatus);
        stampTimestamp(order, newStatus);

        OrderStatusHistory hist = OrderStatusHistory.builder()
                .order(order).status(newStatus).build();
        order.getStatusHistory().add(hist);

        Order saved = orderRepository.save(order);
        broadcastStatus(saved);

        // When delivered: mark partner available again and increment counters
        if (newStatus == OrderStatus.DELIVERED && order.getDeliveryPartner() != null) {
            deliveryPartnerRepository.findByUserId(order.getDeliveryPartner().getId())
                .ifPresent(dp -> {
                    dp.setIsAvailable(true);
                    dp.setTotalDeliveries(dp.getTotalDeliveries() + 1);
                    dp.setTodayDeliveries(dp.getTodayDeliveries() + 1);
                    deliveryPartnerRepository.save(dp);
                    log.info("Partner {} delivery counters updated: total={}", dp.getId(), dp.getTotalDeliveries());
                });
        }

        // Notify customer
        String msg = buildStatusMessage(newStatus);
        notificationService.send(order.getCustomer().getId(),
                "Order Update", msg, NotificationType.ORDER_UPDATE, orderId);

        // Notify delivery partner if assigned
        if (order.getDeliveryPartner() != null && newStatus == OrderStatus.READY_FOR_PICKUP) {
            notificationService.send(order.getDeliveryPartner().getId(),
                    "Order Ready for Pickup", "Order #" + orderId + " is ready.",
                    NotificationType.ORDER_UPDATE, orderId);
        }

        log.info("Order {} → {} by {}", orderId, newStatus, actor.getEmail());

        // Trigger auto assignment when order becomes ready for pickup
        triggerDeliveryAssignmentIfReady(saved);

        return toResponse(saved);
    }

    // After status update, trigger delivery assignment when order is ready for pickup
    private void triggerDeliveryAssignmentIfReady(Order order) {
        if (order.getStatus() == OrderStatus.READY_FOR_PICKUP
                && !Boolean.TRUE.equals(order.getPartnerAssigned())
                && deliveryAssignmentService != null) {
            log.info("Order {} is READY_FOR_PICKUP — starting auto-assignment", order.getId());
            deliveryAssignmentService.startAssignment(order.getId());
        }
    }

    /**
     * Admin manual override: directly assign a specific partner (by userId) to an order.
     * Bypasses the auto-assignment algorithm. Sets partnerAssigned = true so auto-assignment stops.
     */
    @Transactional
    public void manualAssignPartner(Long orderId, Long partnerUserId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        User partner = userRepository.findById(partnerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", partnerUserId));

        order.setDeliveryPartner(partner);
        order.setPartnerAssigned(true);
        orderRepository.save(order);

        notificationService.send(partnerUserId,
                "New Delivery Assigned 🛵",
                "Order #" + orderId + " has been assigned to you by admin.",
                NotificationType.ORDER_UPDATE, orderId);

        notificationService.send(order.getCustomer().getId(),
                "Delivery Partner Assigned! 🛵",
                partner.getName() + " will deliver your order.",
                NotificationType.ORDER_UPDATE, orderId);

        log.info("Admin manually assigned partner {} to order {}", partnerUserId, orderId);
    }

    @Transactional
    public OrderResponse assignDeliveryPartner(Long orderId, Long partnerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        User partner = userRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", partnerId));

        order.setDeliveryPartner(partner);
        Order saved = orderRepository.save(order);

        notificationService.send(partnerId,
                "New Delivery Assigned", "Order #" + orderId + " assigned to you.",
                NotificationType.ORDER_UPDATE, orderId);

        return toResponse(saved);
    }

    public Page<OrderResponse> getCustomerOrders(Long customerId, int page, int size) {
        return orderRepository.findByCustomerIdOrderByPlacedAtDesc(customerId, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    public OrderResponse getOrder(Long orderId, Long userId, Role role) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        boolean allowed = role == Role.SUPER_ADMIN || role == Role.RESTAURANT_ADMIN
                || order.getCustomer().getId().equals(userId)
                || (order.getDeliveryPartner() != null && order.getDeliveryPartner().getId().equals(userId));
        if (!allowed) throw new AccessDeniedException("Not authorized to view this order");

        return toResponse(order);
    }

    public List<OrderResponse> getActiveOrders() {
        return orderRepository.findByStatusIn(
                List.of(OrderStatus.PLACED, OrderStatus.CONFIRMED,
                        OrderStatus.PREPARING, OrderStatus.READY_FOR_PICKUP))
                .stream().map(this::toResponse).toList();
    }

    public List<OrderResponse> getDeliveryPartnerOrders(Long partnerId) {
        return orderRepository.findByDeliveryPartnerId(partnerId)
                .stream().map(this::toResponse).toList();
    }

    public List<OrderResponse> getAvailableForPickup() {
        return orderRepository.findByStatusIn(List.of(OrderStatus.READY_FOR_PICKUP))
                .stream().map(this::toResponse).toList();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private void stampTimestamp(Order order, OrderStatus status) {
        LocalDateTime now = LocalDateTime.now();
        switch (status) {
            case CONFIRMED       -> order.setConfirmedAt(now);
            case PREPARING       -> order.setPreparingAt(now);
            case READY_FOR_PICKUP -> order.setReadyAt(now);
            case OUT_FOR_DELIVERY -> order.setPickedUpAt(now);
            case DELIVERED       -> order.setDeliveredAt(now);
            case CANCELLED       -> order.setCancelledAt(now);
            default -> {}
        }
    }

    private void broadcastStatus(Order order) {
        OrderStatusBroadcast msg = new OrderStatusBroadcast(
                order.getId(), order.getStatus(), order.getEtaMinutes());
        messagingTemplate.convertAndSend("/topic/orders/" + order.getId(), msg);
        messagingTemplate.convertAndSend("/topic/restaurant/orders", msg);
    }

    private String buildStatusMessage(OrderStatus status) {
        return switch (status) {
            case CONFIRMED       -> "Your order has been confirmed by the restaurant!";
            case PREPARING       -> "Your food is being prepared 🍳";
            case READY_FOR_PICKUP -> "Your order is ready for pickup!";
            case OUT_FOR_DELIVERY -> "Your order is out for delivery 🛵";
            case DELIVERED       -> "Your order has been delivered. Enjoy your meal! 😋";
            case CANCELLED       -> "Your order has been cancelled.";
            default              -> "Your order status has been updated.";
        };
    }

    public OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(oi -> OrderItemResponse.builder()
                        .id(oi.getId())
                        .foodItemId(oi.getFoodItem().getId())
                        .foodItemName(oi.getFoodItem().getName())
                        .imageUrl(oi.getFoodItem().getImageUrl())
                        .vegetarian(oi.getFoodItem().getVegetarian())
                        .quantity(oi.getQuantity())
                        .priceAtOrderTime(oi.getPriceAtOrderTime())
                        .lineTotal(oi.getLineTotal())
                        .customizations(oi.getCustomizations())
                        .build())
                .toList();

        List<StatusHistoryResponse> history = order.getStatusHistory().stream()
                .map(h -> StatusHistoryResponse.builder()
                        .status(h.getStatus()).note(h.getNote()).timestamp(h.getTimestamp()).build())
                .toList();

        Address addr = order.getDeliveryAddress();
        AddressResponse addrResp = AddressResponse.builder()
                .id(addr.getId())
                .fullName(addr.getFullName()).phone(addr.getPhone())
                .houseNumber(addr.getHouseNumber()).street(addr.getStreet())
                .area(addr.getArea()).city(addr.getCity()).state(addr.getState())
                .postalCode(addr.getPostalCode())
                .latitude(addr.getLatitude()).longitude(addr.getLongitude())
                .addressType(addr.getAddressType()).isDefault(addr.getIsDefault())
                .build();

        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomer().getId())
                .customerName(order.getCustomer().getName())
                .customerPhone(order.getCustomer().getPhone())
                .deliveryPartnerId(order.getDeliveryPartner() != null ? order.getDeliveryPartner().getId() : null)
                .deliveryPartnerName(order.getDeliveryPartner() != null ? order.getDeliveryPartner().getName() : null)
                .deliveryPartnerPhone(order.getDeliveryPartner() != null ? order.getDeliveryPartner().getPhone() : null)
                .deliveryAddress(addrResp)
                .status(order.getStatus())
                .subtotal(order.getSubtotal())
                .deliveryFee(order.getDeliveryFee())
                .tax(order.getTax())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .couponCode(order.getCouponCode())
                .etaMinutes(order.getEtaMinutes())
                .specialInstructions(order.getSpecialInstructions())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPayment() != null ? order.getPayment().getStatus().name() : null)
                .items(items)
                .statusHistory(history)
                .placedAt(order.getPlacedAt())
                .confirmedAt(order.getConfirmedAt())
                .preparingAt(order.getPreparingAt())
                .readyAt(order.getReadyAt())
                .pickedUpAt(order.getPickedUpAt())
                .deliveredAt(order.getDeliveredAt())
                .cancelledAt(order.getCancelledAt())
                .hasReview(order.getReview() != null)
                .build();
    }

    public record OrderStatusBroadcast(Long orderId, OrderStatus status, Integer etaMinutes) {}
}
