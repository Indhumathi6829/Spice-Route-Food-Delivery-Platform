package com.spiceroute.delivery.service;

import com.spiceroute.delivery.dto.FestivalOfferRequest;
import com.spiceroute.delivery.dto.FestivalOfferResponse;
import com.spiceroute.delivery.entity.FestivalOffer;
import com.spiceroute.delivery.exception.ResourceNotFoundException;
import com.spiceroute.delivery.repository.FestivalOfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FestivalOfferService {

    private final FestivalOfferRepository repo;

    // ── Public ────────────────────────────────────────────────────────────────

    /** Returns only offers that are currently active (active=true AND within dates). */
    public List<FestivalOfferResponse> getActiveOffers() {
        return repo.findCurrentlyActive(LocalDateTime.now())
                   .stream().map(this::toResponse).toList();
    }

    // ── Admin CRUD ────────────────────────────────────────────────────────────

    public List<FestivalOfferResponse> getAll() {
        return repo.findAllByOrderByCreatedAtDesc()
                   .stream().map(this::toResponse).toList();
    }

    public FestivalOfferResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public FestivalOfferResponse create(FestivalOfferRequest req) {
        FestivalOffer offer = FestivalOffer.builder()
                .festivalName(req.getFestivalName())
                .title(req.getTitle())
                .description(req.getDescription())
                .bannerImage(req.getBannerImage())
                .discountType(req.getDiscountType())
                .discountValue(req.getDiscountValue())
                .maximumDiscount(req.getMaximumDiscount())
                .minimumOrderValue(req.getMinimumOrderValue() != null ? req.getMinimumOrderValue() : java.math.BigDecimal.ZERO)
                .couponCode(req.getCouponCode())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .applicableCategories(req.getApplicableCategories())
                .applicableRestaurants(req.getApplicableRestaurants())
                .active(req.getActive() != null ? req.getActive() : true)
                .build();
        return toResponse(repo.save(offer));
    }

    @Transactional
    public FestivalOfferResponse update(Long id, FestivalOfferRequest req) {
        FestivalOffer offer = findById(id);
        offer.setFestivalName(req.getFestivalName());
        offer.setTitle(req.getTitle());
        offer.setDescription(req.getDescription());
        if (req.getBannerImage() != null) offer.setBannerImage(req.getBannerImage());
        offer.setDiscountType(req.getDiscountType());
        offer.setDiscountValue(req.getDiscountValue());
        offer.setMaximumDiscount(req.getMaximumDiscount());
        if (req.getMinimumOrderValue() != null) offer.setMinimumOrderValue(req.getMinimumOrderValue());
        if (req.getCouponCode() != null) offer.setCouponCode(req.getCouponCode());
        offer.setStartDate(req.getStartDate());
        offer.setEndDate(req.getEndDate());
        offer.setApplicableCategories(req.getApplicableCategories());
        offer.setApplicableRestaurants(req.getApplicableRestaurants());
        if (req.getActive() != null) offer.setActive(req.getActive());
        return toResponse(repo.save(offer));
    }

    @Transactional
    public void delete(Long id) {
        repo.delete(findById(id));
    }

    @Transactional
    public FestivalOfferResponse toggleActive(Long id) {
        FestivalOffer offer = findById(id);
        offer.setActive(!offer.getActive());
        return toResponse(repo.save(offer));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private FestivalOffer findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FestivalOffer", id));
    }

    public FestivalOfferResponse toResponse(FestivalOffer o) {
        LocalDateTime now = LocalDateTime.now();
        String status;
        if (!Boolean.TRUE.equals(o.getActive())) {
            status = "INACTIVE";
        } else if (o.getStartDate() != null && now.isBefore(o.getStartDate())) {
            status = "UPCOMING";
        } else if (o.getEndDate() != null && now.isAfter(o.getEndDate())) {
            status = "EXPIRED";
        } else {
            status = "ACTIVE";
        }

        return FestivalOfferResponse.builder()
                .id(o.getId())
                .festivalName(o.getFestivalName())
                .title(o.getTitle())
                .description(o.getDescription())
                .bannerImage(o.getBannerImage())
                .discountType(o.getDiscountType())
                .discountValue(o.getDiscountValue())
                .maximumDiscount(o.getMaximumDiscount())
                .minimumOrderValue(o.getMinimumOrderValue())
                .couponCode(o.getCouponCode())
                .startDate(o.getStartDate())
                .endDate(o.getEndDate())
                .applicableCategories(o.getApplicableCategories())
                .applicableRestaurants(o.getApplicableRestaurants())
                .active(o.getActive())
                .currentlyActive(o.isCurrentlyActive())
                .status(status)
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }
}
