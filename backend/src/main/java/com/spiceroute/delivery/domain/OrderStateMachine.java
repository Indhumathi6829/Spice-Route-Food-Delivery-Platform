package com.spiceroute.delivery.domain;

import com.spiceroute.delivery.entity.OrderStatus;
import com.spiceroute.delivery.entity.Role;
import com.spiceroute.delivery.exception.BusinessException;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Enforces the order lifecycle — illegal transitions are rejected before DB writes.
 *
 * PLACED → CONFIRMED → PREPARING → READY_FOR_PICKUP → OUT_FOR_DELIVERY → DELIVERED
 * Any state (except DELIVERED) can transition to CANCELLED subject to role rules.
 */
@Component
public class OrderStateMachine {

    // What each role is allowed to transition to from any given status
    private static final Map<Role, Map<OrderStatus, Set<OrderStatus>>> ROLE_TRANSITIONS = Map.of(
            Role.SUPER_ADMIN, Map.of(
                    OrderStatus.PLACED,          EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
                    OrderStatus.CONFIRMED,       EnumSet.of(OrderStatus.PREPARING, OrderStatus.CANCELLED),
                    OrderStatus.PREPARING,       EnumSet.of(OrderStatus.READY_FOR_PICKUP, OrderStatus.CANCELLED),
                    OrderStatus.READY_FOR_PICKUP, EnumSet.of(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED),
                    OrderStatus.OUT_FOR_DELIVERY, EnumSet.of(OrderStatus.DELIVERED, OrderStatus.CANCELLED),
                    OrderStatus.DELIVERED,       EnumSet.noneOf(OrderStatus.class),
                    OrderStatus.CANCELLED,       EnumSet.noneOf(OrderStatus.class)
            ),
            Role.RESTAURANT_ADMIN, Map.of(
                    OrderStatus.PLACED,          EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
                    OrderStatus.CONFIRMED,       EnumSet.of(OrderStatus.PREPARING),
                    OrderStatus.PREPARING,       EnumSet.of(OrderStatus.READY_FOR_PICKUP),
                    OrderStatus.READY_FOR_PICKUP, EnumSet.noneOf(OrderStatus.class),
                    OrderStatus.OUT_FOR_DELIVERY, EnumSet.noneOf(OrderStatus.class),
                    OrderStatus.DELIVERED,       EnumSet.noneOf(OrderStatus.class),
                    OrderStatus.CANCELLED,       EnumSet.noneOf(OrderStatus.class)
            ),
            Role.DELIVERY_PARTNER, Map.of(
                    OrderStatus.PLACED,          EnumSet.noneOf(OrderStatus.class),
                    OrderStatus.CONFIRMED,       EnumSet.noneOf(OrderStatus.class),
                    OrderStatus.PREPARING,       EnumSet.noneOf(OrderStatus.class),
                    OrderStatus.READY_FOR_PICKUP, EnumSet.of(OrderStatus.OUT_FOR_DELIVERY),
                    OrderStatus.OUT_FOR_DELIVERY, EnumSet.of(OrderStatus.DELIVERED),
                    OrderStatus.DELIVERED,       EnumSet.noneOf(OrderStatus.class),
                    OrderStatus.CANCELLED,       EnumSet.noneOf(OrderStatus.class)
            ),
            Role.CUSTOMER, Map.of(
                    OrderStatus.PLACED,          EnumSet.of(OrderStatus.CANCELLED),
                    OrderStatus.CONFIRMED,       EnumSet.of(OrderStatus.CANCELLED),
                    OrderStatus.PREPARING,       EnumSet.noneOf(OrderStatus.class),
                    OrderStatus.READY_FOR_PICKUP, EnumSet.noneOf(OrderStatus.class),
                    OrderStatus.OUT_FOR_DELIVERY, EnumSet.noneOf(OrderStatus.class),
                    OrderStatus.DELIVERED,       EnumSet.noneOf(OrderStatus.class),
                    OrderStatus.CANCELLED,       EnumSet.noneOf(OrderStatus.class)
            )
    );

    public void validate(OrderStatus current, OrderStatus next, Role role) {
        if (current == next) {
            throw new BusinessException("Order is already in status: " + current);
        }

        Map<OrderStatus, Set<OrderStatus>> transitions = ROLE_TRANSITIONS.get(role);
        if (transitions == null) {
            throw new BusinessException("Unknown role: " + role);
        }

        Set<OrderStatus> allowed = transitions.getOrDefault(current, EnumSet.noneOf(OrderStatus.class));
        if (!allowed.contains(next)) {
            throw new BusinessException(
                    "Transition " + current + " → " + next + " is not allowed for role " + role);
        }
    }

    public boolean isTerminal(OrderStatus status) {
        return status == OrderStatus.DELIVERED || status == OrderStatus.CANCELLED;
    }
}
