package com.spiceroute.delivery.config;

import com.spiceroute.delivery.entity.DeliveryPartner;
import com.spiceroute.delivery.entity.Role;
import com.spiceroute.delivery.entity.User;
import com.spiceroute.delivery.repository.DeliveryPartnerRepository;
import com.spiceroute.delivery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Seeds demo users (admin + delivery partners) and ensures every
 * DELIVERY_PARTNER user has a corresponding DeliveryPartner profile row.
 *
 * This seeder runs at ORDER(1) — BEFORE DatabaseSeeder (ORDER(2)) so that
 * delivery partner profiles are always present regardless of whether the
 * main food-item seed has already run.
 *
 * It is idempotent: every operation is guarded by an existence check.
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class UserSeeder implements CommandLineRunner {

    private final UserRepository            userRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final PasswordEncoder           passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedDemoUsers();
        repairDeliveryPartnerProfiles();
    }

    // ── Demo Users ────────────────────────────────────────────────────────────

    private void seedDemoUsers() {

        // ── Admin ───────────────────────────────────────────────────────────
        createUserIfAbsent(
                "SpiceRoute Admin",
                "admin@spiceroute.com",
                "Admin@123",
                "9900000001",
                Role.RESTAURANT_ADMIN
        );

        // ── Customer demo ───────────────────────────────────────────────────
        createUserIfAbsent(
                "Priya Sharma",
                "priya@example.com",
                "Test@123",
                "9876543210",
                Role.CUSTOMER
        );

        createUserIfAbsent(
                "Arjun Reddy",
                "arjun@example.com",
                "Test@123",
                "9876543211",
                Role.CUSTOMER
        );

        // ── Delivery Partners ───────────────────────────────────────────────
        User suresh = createUserIfAbsent(
                "Suresh Babu",
                "suresh@spiceroute.com",
                "Delivery@123",
                "9500000001",
                Role.DELIVERY_PARTNER
        );

        User vijay = createUserIfAbsent(
                "Vijay Kumar",
                "vijay@spiceroute.com",
                "Delivery@123",
                "9500000002",
                Role.DELIVERY_PARTNER
        );

        User kavitha = createUserIfAbsent(
                "Kavitha Rajan",
                "kavitha@spiceroute.com",
                "Delivery@123",
                "9500000003",
                Role.DELIVERY_PARTNER
        );

        User mohan = createUserIfAbsent(
                "Mohan Das",
                "mohan@spiceroute.com",
                "Delivery@123",
                "9500000004",
                Role.DELIVERY_PARTNER
        );

        // Ensure profiles with realistic data
        ensureDeliveryProfile(suresh, "BIKE",    "TN01AB1234", 4.8, 120, true,  true,  13.0827, 80.2707);  // Chennai
        ensureDeliveryProfile(vijay,  "SCOOTER", "KA01CD5678", 4.6,  87, false, true,  12.9716, 77.5946);  // Bangalore
        ensureDeliveryProfile(kavitha,"BIKE",    "TN11EF9012", 4.9,  65, true,  true,  11.0168, 76.9558);  // Coimbatore
        ensureDeliveryProfile(mohan,  "BICYCLE", "TN21GH3456", 4.7,  43, false, true,  17.3850, 78.4867);  // Hyderabad
    }

    // ── Repair: ensure every DELIVERY_PARTNER user has a profile row ─────────

    private void repairDeliveryPartnerProfiles() {
        List<User> partners = userRepository.findByRole(Role.DELIVERY_PARTNER);
        int created = 0;
        for (User u : partners) {
            if (!deliveryPartnerRepository.existsByUserId(u.getId())) {
                DeliveryPartner profile = DeliveryPartner.builder()
                        .user(u)
                        .isOnline(false)
                        .isAvailable(true)
                        .rating(BigDecimal.valueOf(5.0))
                        .totalRatings(0)
                        .totalDeliveries(0)
                        .todayDeliveries(0)
                        .build();
                deliveryPartnerRepository.save(profile);
                created++;
                log.info("Created missing DeliveryPartner profile for user {} ({})", u.getEmail(), u.getId());
            }
        }
        if (created > 0) {
            log.info("Repaired {} missing DeliveryPartner profile(s).", created);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Creates a user only if the email doesn't already exist.
     * Returns the existing or newly created user.
     */
    private User createUserIfAbsent(String name, String email, String rawPassword,
                                    String phone, Role role) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User u = User.builder()
                    .name(name)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(rawPassword))
                    .phone(phone)
                    .role(role)
                    .active(true)
                    .build();
            User saved = userRepository.save(u);
            log.info("Seeded user: {} ({})", email, role);
            return saved;
        });
    }

    /**
     * Creates or updates the DeliveryPartner profile for a given user
     * with realistic demo data.
     */
    private void ensureDeliveryProfile(User user,
                                       String vehicleType, String vehicleNumber,
                                       double rating, int totalDeliveries,
                                       boolean isOnline, boolean isAvailable,
                                       double lat, double lon) {
        if (user == null) return;

        deliveryPartnerRepository.findByUserId(user.getId()).ifPresentOrElse(
            dp -> {
                // Only update fields that still have defaults — don't overwrite live data
                if (dp.getVehicleType() == null) dp.setVehicleType(vehicleType);
                if (dp.getVehicleNumber() == null) dp.setVehicleNumber(vehicleNumber);
                if (dp.getTotalDeliveries() == null || dp.getTotalDeliveries() == 0) {
                    dp.setTotalDeliveries(totalDeliveries);
                    dp.setRating(BigDecimal.valueOf(rating));
                    dp.setTotalRatings(totalDeliveries);
                }
                if (dp.getCurrentLatitude() == null) {
                    dp.setCurrentLatitude(lat);
                    dp.setCurrentLongitude(lon);
                }
                deliveryPartnerRepository.save(dp);
            },
            () -> {
                DeliveryPartner dp = DeliveryPartner.builder()
                        .user(user)
                        .vehicleType(vehicleType)
                        .vehicleNumber(vehicleNumber)
                        .rating(BigDecimal.valueOf(rating))
                        .totalRatings(totalDeliveries)
                        .isOnline(isOnline)
                        .isAvailable(isAvailable)
                        .currentLatitude(lat)
                        .currentLongitude(lon)
                        .totalDeliveries(totalDeliveries)
                        .todayDeliveries(0)
                        .build();
                deliveryPartnerRepository.save(dp);
                log.info("Seeded DeliveryPartner profile for {}", user.getEmail());
            }
        );
    }
}
