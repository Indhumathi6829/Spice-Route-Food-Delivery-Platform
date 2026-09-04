package com.spiceroute.delivery.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "food_items", indexes = {
    @Index(name = "idx_food_category", columnList = "category_id"),
    @Index(name = "idx_food_available", columnList = "available")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(precision = 10, scale = 2)
    private BigDecimal discountPrice;

    private String imageUrl;

    @Builder.Default
    private Boolean vegetarian = true;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SpicyLevel spicyLevel = SpicyLevel.MILD;

    /** Estimated preparation time in minutes */
    private Integer preparationTime;

    private Integer calories;

    @Column(precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal rating = BigDecimal.valueOf(0.0);

    private Integer totalRatings = 0;

    @Builder.Default
    private Boolean available = true;

    @Builder.Default
    private Boolean bestseller = false;

    /** Comma-separated ingredients list */
    private String ingredients;

    @OneToMany(mappedBy = "foodItem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<CustomizationGroup> customizationGroups = new ArrayList<>();

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist  protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate   protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public BigDecimal getEffectivePrice() {
        return (discountPrice != null && discountPrice.compareTo(BigDecimal.ZERO) > 0) ? discountPrice : price;
    }
}
