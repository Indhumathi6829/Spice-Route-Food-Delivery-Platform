package com.foodexpress.domain;

import com.foodexpress.entity.OrderStatus;
import com.foodexpress.entity.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import static org.junit.jupiter.api.Assertions.*;

class OrderStateMachineTest {

    private OrderStateMachine machine;

    @BeforeEach
    void setUp() {
        machine = new OrderStateMachine();
    }

    @Test
    @DisplayName("Restaurant accepts PLACED → CONFIRMED")
    void restaurantConfirmsOrder() {
        assertDoesNotThrow(() -> machine.validate(OrderStatus.PLACED, OrderStatus.CONFIRMED, Role.RESTAURANT_OWNER));
    }

    @Test
    @DisplayName("Illegal jump PLACED → DELIVERED is rejected")
    void illegalJumpRejected() {
        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> machine.validate(OrderStatus.PLACED, OrderStatus.DELIVERED, Role.RESTAURANT_OWNER));
        assertTrue(ex.getMessage().contains("Illegal transition"));
    }

    @Test
    @DisplayName("Customer can cancel from PLACED")
    void customerCancelsFromPlaced() {
        assertDoesNotThrow(() -> machine.validate(OrderStatus.PLACED, OrderStatus.CANCELLED, Role.CUSTOMER));
    }

    @Test
    @DisplayName("Customer cannot cancel from PREPARING")
    void customerCannotCancelFromPreparing() {
        assertThrows(IllegalStateException.class,
                () -> machine.validate(OrderStatus.PREPARING, OrderStatus.CANCELLED, Role.CUSTOMER));
    }

    @Test
    @DisplayName("Full happy-path lifecycle is valid per role")
    void fullHappyPath() {
        assertDoesNotThrow(() -> machine.validate(OrderStatus.PLACED, OrderStatus.CONFIRMED, Role.RESTAURANT_OWNER));
        assertDoesNotThrow(() -> machine.validate(OrderStatus.CONFIRMED, OrderStatus.PREPARING, Role.RESTAURANT_OWNER));
        assertDoesNotThrow(() -> machine.validate(OrderStatus.PREPARING, OrderStatus.READY_FOR_PICKUP, Role.RESTAURANT_OWNER));
        assertDoesNotThrow(() -> machine.validate(OrderStatus.READY_FOR_PICKUP, OrderStatus.OUT_FOR_DELIVERY, Role.DELIVERY_PARTNER));
        assertDoesNotThrow(() -> machine.validate(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED, Role.DELIVERY_PARTNER));
    }

    @ParameterizedTest
    @EnumSource(value = OrderStatus.class, names = {"DELIVERED", "CANCELLED"})
    @DisplayName("Terminal states have no outgoing transitions")
    void terminalStates(OrderStatus terminal) {
        assertTrue(machine.isTerminal(terminal));
        assertThrows(IllegalStateException.class,
                () -> machine.validate(terminal, OrderStatus.PLACED, Role.ADMIN));
    }
}
