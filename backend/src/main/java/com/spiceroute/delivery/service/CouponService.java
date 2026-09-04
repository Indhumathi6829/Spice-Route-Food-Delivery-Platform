package com.spiceroute.delivery.service;

import com.spiceroute.delivery.dto.CouponRequest;
import com.spiceroute.delivery.dto.CouponResponse;
import com.spiceroute.delivery.entity.Coupon;
import com.spiceroute.delivery.exception.BusinessException;
import com.spiceroute.delivery.exception.ResourceNotFoundException;
import com.spiceroute.delivery.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    public List<CouponResponse> getAll() {
        return couponRepository.findAll().stream().map(this::toResponse).toList();
    }

    public CouponResponse getById(Long id) {
        return toResponse(findById(id));
    }

    public CouponResponse validateAndPreview(String code, BigDecimal orderAmount) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new BusinessException("Coupon code '" + code + "' not found"));

        if (!coupon.isValid()) {
            throw new BusinessException("Coupon is expired or no longer valid");
        }
        if (coupon.getMinimumOrderValue() != null
                && orderAmount.compareTo(coupon.getMinimumOrderValue()) < 0) {
            throw new BusinessException("Minimum order value of ₹" + coupon.getMinimumOrderValue()
                    + " required to use this coupon");
        }
        return toResponse(coupon);
    }

    @Transactional
    public CouponResponse create(CouponRequest req) {
        if (couponRepository.existsByCodeIgnoreCase(req.getCode())) {
            throw new BusinessException("Coupon code '" + req.getCode() + "' already exists");
        }
        Coupon coupon = Coupon.builder()
                .code(req.getCode().toUpperCase())
                .description(req.getDescription())
                .discountType(req.getDiscountType())
                .discountValue(req.getDiscountValue())
                .minimumOrderValue(req.getMinimumOrderValue())
                .maximumDiscount(req.getMaximumDiscount())
                .startDate(req.getStartDate())
                .expiryDate(req.getExpiryDate())
                .usageLimit(req.getUsageLimit())
                .active(req.getActive() != null ? req.getActive() : true)
                .build();
        return toResponse(couponRepository.save(coupon));
    }

    @Transactional
    public CouponResponse update(Long id, CouponRequest req) {
        Coupon coupon = findById(id);
        coupon.setDescription(req.getDescription());
        coupon.setDiscountType(req.getDiscountType());
        coupon.setDiscountValue(req.getDiscountValue());
        coupon.setMinimumOrderValue(req.getMinimumOrderValue());
        coupon.setMaximumDiscount(req.getMaximumDiscount());
        coupon.setStartDate(req.getStartDate());
        coupon.setExpiryDate(req.getExpiryDate());
        coupon.setUsageLimit(req.getUsageLimit());
        if (req.getActive() != null) coupon.setActive(req.getActive());
        return toResponse(couponRepository.save(coupon));
    }

    @Transactional
    public void delete(Long id) {
        couponRepository.delete(findById(id));
    }

    @Transactional
    public CouponResponse toggleActive(Long id) {
        Coupon c = findById(id);
        c.setActive(!c.getActive());
        return toResponse(couponRepository.save(c));
    }

    private Coupon findById(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", id));
    }

    private CouponResponse toResponse(Coupon c) {
        return CouponResponse.builder()
                .id(c.getId())
                .code(c.getCode())
                .description(c.getDescription())
                .discountType(c.getDiscountType())
                .discountValue(c.getDiscountValue())
                .minimumOrderValue(c.getMinimumOrderValue())
                .maximumDiscount(c.getMaximumDiscount())
                .startDate(c.getStartDate())
                .expiryDate(c.getExpiryDate())
                .usageLimit(c.getUsageLimit())
                .usageCount(c.getUsageCount())
                .active(c.getActive())
                .valid(c.isValid())
                .build();
    }
}
