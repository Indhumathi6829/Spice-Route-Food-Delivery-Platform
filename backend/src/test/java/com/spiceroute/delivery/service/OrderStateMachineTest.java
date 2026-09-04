package com.spiceroute.delivery.service;

import com.spiceroute.delivery.domain.OrderStateMachine;
import com.spiceroute.delivery.entity.OrderStatus;
import com.spiceroute.delivery.entity.Role;
import com.spiceroute.delivery.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class OrderStateMachineTest {

    private OrderStateMachine stateMachine;

    @BeforeEach
    void setUp() {
        stateMachine = new OrderStateMachine();
    }

    // ── Restaurant Admin valid transitions ──────────────────────────────────

    @Test
    void restaurantAdmin_canConfirmPlacedOrder() {
        assertDoesNotThrow(() -> stateMachine.validate(OrderStatus.PLACED, OrderStatus.CONFIRMED, Role.RESTAURANT_ADMIN));
    }

    @Test
    void restaurantAdmin_canStartPreparing() {
        assertDoesNotThrow(() -> stateMachine.validate(OrderStatus.CONFIRMED, OrderStatus.PREPARING, Role.RESTAURANT_ADMIN));
    }

    @Test
    void restaurantAdmin_canMarkReadyForPickup() {
        assertDoesNotThrow(() -> stateMachine.validate(OrderStatus.PREPARING, OrderStatus.READY_FOR_PICKUP, Role.RESTAURANT_ADMIN));
    }

    @Test
    void restaurantAdmin_canCancelPlacedOrder() {
        assertDoesNotThrow(() -> stateMachine.validate(OrderStatus.PLACED, OrderStatus.CANCELLED, Role.RESTAURANT_ADMIN));
    }

    // ── Delivery partner valid transitions ──────────────────────────────────

    @Test
    void deliveryPartner_canAcceptPickup() {
        assertDoesNotThrow(() -> stateMachine.validate(OrderStatus.READY_FOR_PICKUP, OrderStatus.OUT_FOR_DELIVERY, Role.DELIVERY_PARTNER));
    }

    @Test
    void deliveryPartner_canMarkDelivered() {
        assertDoesNotThrow(() -> stateMachine.validate(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED, Role.DELIVERY_PARTNER));
    }

    // ── Customer valid transitions ──────────────────────────────────────────

    @Test
    void customer_canCancelPlacedOrder() {
        assertDoesNotThrow(() -> stateMachine.validate(OrderStatus.PLACED, OrderStatus.CANCELLED, Role.CUSTOMER));
    }

    @Test
    void customer_canCancelConfirmedOrder() {
        assertDoesNotThrow(() -> stateMachine.validate(OrderStatus.CONFIRMED, OrderStatus.CANCELLED, Role.CUSTOMER));
    }

    // ── Invalid transitions ─────────────────────────────────────────────────

    @Test
    void customer_cannotMarkDelivered() {
        assertThrows(BusinessException.class, () ->
                stateMachine.validate(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED, Role.CUSTOMER));
    }

    @Test
    void deliveryPartner_cannotConfirmOrder() {
        assertThrows(BusinessException.class, () ->
                stateMachine.validate(OrderStatus.PLACED, OrderStatus.CONFIRMED, Role.DELIVERY_PARTNER));
    }

    @Test
    void restaurantAdmin_cannotPickupOrder() {
        assertThrows(BusinessException.class, () ->
                stateMachine.validate(OrderStatus.READY_FOR_PICKUP, OrderStatus.OUT_FOR_DELIVERY, Role.RESTAURANT_ADMIN));
    }

    @Test
    void sameStatus_throwsException() {
        assertThrows(BusinessException.class, () ->
                stateMachine.validate(OrderStatus.PLACED, OrderStatus.PLACED, Role.SUPER_ADMIN));
    }

    @Test
    void deliveredOrder_isTerminal() {
        assertTrue(stateMachine.isTerminal(OrderStatus.DELIVERED));
    }

    @Test
    void cancelledOrder_isTerminal() {
        assertTrue(stateMachine.isTerminal(OrderStatus.CANCELLED));
    }

    @Test
    void placedOrder_isNotTerminal() {
        assertFalse(stateMachine.isTerminal(OrderStatus.PLACED));
    }

    // ── Super Admin full power ──────────────────────────────────────────────

    @Test
    void superAdmin_hasFullControl() {
        assertDoesNotThrow(() -> {
            stateMachine.validate(OrderStatus.PLACED,           OrderStatus.CONFIRMED,        Role.SUPER_ADMIN);
            stateMachine.validate(OrderStatus.CONFIRMED,        OrderStatus.PREPARING,        Role.SUPER_ADMIN);
            stateMachine.validate(OrderStatus.PREPARING,        OrderStatus.READY_FOR_PICKUP, Role.SUPER_ADMIN);
            stateMachine.validate(OrderStatus.READY_FOR_PICKUP, OrderStatus.OUT_FOR_DELIVERY, Role.SUPER_ADMIN);
            stateMachine.validate(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED,        Role.SUPER_ADMIN);
        });
    }
}
