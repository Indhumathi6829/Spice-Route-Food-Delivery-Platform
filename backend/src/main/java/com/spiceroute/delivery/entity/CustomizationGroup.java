package com.spiceroute.delivery.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customization_groups")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CustomizationGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id", nullable = false)
    private FoodItem foodItem;

    @Column(nullable = false)
    private String name;             // e.g. "Size", "Extras"

    @Builder.Default
    private Boolean required = false;

    @Builder.Default
    private Boolean multiSelect = false;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CustomizationOption> options = new ArrayList<>();
}
