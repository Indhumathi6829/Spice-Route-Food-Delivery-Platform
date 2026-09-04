package com.spiceroute.delivery.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "customization_options")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CustomizationOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private CustomizationGroup group;

    @Column(nullable = false)
    private String name;             // e.g. "Large", "Extra Cheese"

    @Column(precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal additionalPrice = BigDecimal.ZERO;
}
