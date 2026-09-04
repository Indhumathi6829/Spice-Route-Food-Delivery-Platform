package com.spiceroute.delivery.service;

import com.spiceroute.delivery.entity.Coupon;
import com.spiceroute.delivery.entity.DiscountType;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class CouponServiceTest {

    private Coupon buildCoupon(DiscountType type, double value, Double maxDisc, Double minOrder) {
        Coupon c = new Coupon();
        c.setCode("TEST");
        c.setDiscountType(type);
        c.setDiscountValue(BigDecimal.valueOf(value));
        c.setMaximumDiscount(maxDisc != null ? BigDecimal.valueOf(maxDisc) : null);
        c.setMinimumOrderValue(minOrder != null ? BigDecimal.valueOf(minOrder) : null);
        c.setStartDate(LocalDateTime.now().minusDays(1));
        c.setExpiryDate(LocalDateTime.now().plusDays(30));
        c.setActive(true);
        c.setUsageCount(0);
        return c;
    }

    @Test
    void percentageCoupon_calculatesDiscount() {
        Coupon c = buildCoupon(DiscountType.PERCENTAGE, 20, 100.0, 200.0);
        BigDecimal discount = c.calculateDiscount(BigDecimal.valueOf(500));
        // 20% of 500 = 100, capped at maxDiscount 100
        assertEquals(BigDecimal.valueOf(100).setScale(2, java.math.RoundingMode.HALF_UP),
                     discount.setScale(2, java.math.RoundingMode.HALF_UP));
    }

    @Test
    void percentageCoupon_respectsMaxDiscount() {
        Coupon c = buildCoupon(DiscountType.PERCENTAGE, 50, 80.0, 100.0);
        BigDecimal discount = c.calculateDiscount(BigDecimal.valueOf(300));
        // 50% of 300 = 150, capped at maxDiscount 80
        assertEquals(0, discount.compareTo(BigDecimal.valueOf(80)));
    }

    @Test
    void flatCoupon_calculatesDiscount() {
        Coupon c = buildCoupon(DiscountType.FLAT, 100, null, 200.0);
        BigDecimal discount = c.calculateDiscount(BigDecimal.valueOf(500));
        assertEquals(0, discount.compareTo(BigDecimal.valueOf(100)));
    }

    @Test
    void flatCoupon_cannotExceedOrderAmount() {
        Coupon c = buildCoupon(DiscountType.FLAT, 999, null, 0.0);
        BigDecimal discount = c.calculateDiscount(BigDecimal.valueOf(200));
        assertEquals(0, discount.compareTo(BigDecimal.valueOf(200)));
    }

    @Test
    void expiredCoupon_isNotValid() {
        Coupon c = buildCoupon(DiscountType.FLAT, 50, null, 0.0);
        c.setExpiryDate(LocalDateTime.now().minusDays(1));
        assertFalse(c.isValid());
    }

    @Test
    void inactiveCoupon_isNotValid() {
        Coupon c = buildCoupon(DiscountType.FLAT, 50, null, 0.0);
        c.setActive(false);
        assertFalse(c.isValid());
    }

    @Test
    void validCoupon_isValid() {
        Coupon c = buildCoupon(DiscountType.PERCENTAGE, 20, null, 100.0);
        assertTrue(c.isValid());
    }

    @Test
    void couponWithUsageLimit_exhausted_isNotValid() {
        Coupon c = buildCoupon(DiscountType.FLAT, 50, null, 0.0);
        c.setUsageLimit(5);
        c.setUsageCount(5);
        assertFalse(c.isValid());
    }
}
