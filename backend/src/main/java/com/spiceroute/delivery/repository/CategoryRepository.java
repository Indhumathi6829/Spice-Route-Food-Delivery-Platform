package com.spiceroute.delivery.repository;

import com.spiceroute.delivery.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByActiveTrue();
    List<Category> findAllByOrderBySortOrderAsc();
    Optional<Category> findByNameIgnoreCase(String name);
}
