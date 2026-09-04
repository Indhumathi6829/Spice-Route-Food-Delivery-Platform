package com.spiceroute.delivery.service;

import com.spiceroute.delivery.dto.CartItemRequest;
import com.spiceroute.delivery.dto.CartItemResponse;
import com.spiceroute.delivery.dto.CartResponse;
import com.spiceroute.delivery.entity.*;
import com.spiceroute.delivery.exception.BusinessException;
import com.spiceroute.delivery.exception.ResourceNotFoundException;
import com.spiceroute.delivery.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private static final BigDecimal DELIVERY_FEE = BigDecimal.valueOf(49);
    private static final BigDecimal TAX_RATE = BigDecimal.valueOf(0.05);

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final FoodItemRepository foodItemRepository;
    private final UserRepository userRepository;

    public CartResponse getCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse addItem(Long userId, CartItemRequest req) {
        Cart cart = getOrCreateCart(userId);
        FoodItem foodItem = foodItemRepository.findById(req.getFoodItemId())
                .orElseThrow(() -> new ResourceNotFoundException("FoodItem", req.getFoodItemId()));

        if (!foodItem.getAvailable()) {
            throw new BusinessException("'" + foodItem.getName() + "' is currently not available");
        }

        Optional<CartItem> existing = cartItemRepository.findByCartIdAndFoodItemId(cart.getId(), foodItem.getId());
        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + req.getQuantity());
            cartItemRepository.save(item);
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .foodItem(foodItem)
                    .quantity(req.getQuantity())
                    .unitPrice(foodItem.getEffectivePrice())
                    .customizations(req.getCustomizations())
                    .build();
            cart.getItems().add(item);
        }

        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse updateItem(Long userId, Long cartItemId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BusinessException("Cart item does not belong to your cart");
        }

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse removeItem(Long userId, Long cartItemId) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BusinessException("Cart item does not belong to your cart");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartItemRepository.deleteByCartId(cart.getId());
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
                    Cart newCart = Cart.builder().user(user).build();
                    return cartRepository.save(newCart);
                });
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(this::toItemResponse)
                .toList();

        BigDecimal subtotal = cart.getSubtotal();
        BigDecimal tax = subtotal.multiply(TAX_RATE);
        BigDecimal total = subtotal.add(DELIVERY_FEE).add(tax);

        return CartResponse.builder()
                .id(cart.getId())
                .items(itemResponses)
                .subtotal(subtotal)
                .deliveryFee(DELIVERY_FEE)
                .tax(tax)
                .total(total)
                .itemCount(cart.getItems().stream().mapToInt(CartItem::getQuantity).sum())
                .build();
    }

    private CartItemResponse toItemResponse(CartItem item) {
        return CartItemResponse.builder()
                .id(item.getId())
                .foodItemId(item.getFoodItem().getId())
                .foodItemName(item.getFoodItem().getName())
                .imageUrl(item.getFoodItem().getImageUrl())
                .vegetarian(item.getFoodItem().getVegetarian())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .lineTotal(item.getLineTotal())
                .customizations(item.getCustomizations())
                .build();
    }
}
