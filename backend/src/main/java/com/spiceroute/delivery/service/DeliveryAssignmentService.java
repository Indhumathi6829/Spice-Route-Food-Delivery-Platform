package com.spiceroute.delivery.service;

import com.spiceroute.delivery.entity.*;
import com.spiceroute.delivery.exception.BusinessException;
import com.spiceroute.delivery.exception.ResourceNotFoundException;
import com.spiceroute.delivery.repository.*;
import com.spiceroute.delivery.util.GeoUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryAssignmentService {

    @Value("${app.delivery.initial-radius-km:3.0}")
    private double initialRadiusKm;

    @Value("${app.delivery.max-radius-km:10.0}")
    private double maxRadiusKm;

    @Value("${app.delivery.radius-step-km:2.0}")
    private double radiusStepKm;

    @Value("${app.delivery.assignment-timeout-seconds:60}")
    private int assignmentTimeoutSeconds;

    @Value("${app.delivery.max-assignment-attempts:5}")
    private int maxAttempts;

    private final OrderRepository            orderRepository;
    private final DeliveryPartnerRepository  partnerRepository;
    private final DeliveryAssignmentRepository assignmentRepository;
    private final UserRepository             userRepository;
    private final NotificationService        notificationService;
    private final FcmService                 fcmService;
    private final SimpMessagingTemplate      messagingTemplate;

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Entry point called when an order is ready for delivery assignment.
     * Runs asynchronously so it doesn't block the order placement thread.
     */
    @Async
    public void startAssignment(Long orderId) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

            log.info("Starting delivery assignment for order {}", orderId);
            attemptAssignment(order, 1);
        } catch (Exception e) {
            log.error("Assignment failed for order {}: {}", orderId, e.getMessage());
        }
    }

    /** Delivery partner accepts the pending assignment */
    @Transactional
    public void acceptAssignment(Long assignmentId, Long partnerId) {
        DeliveryAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", assignmentId));

        if (!assignment.getPartner().getUser().getId().equals(partnerId)) {
            throw new BusinessException("Assignment does not belong to this partner");
        }
        if (assignment.getStatus() != AssignmentStatus.PENDING) {
            throw new BusinessException("Assignment is no longer pending");
        }

        Order order = assignment.getOrder();

        assignment.setStatus(AssignmentStatus.ACCEPTED);
        assignment.setRespondedAt(LocalDateTime.now());
        assignmentRepository.save(assignment);

        // Mark partner as unavailable and set on order
        DeliveryPartner partner = assignment.getPartner();
        partner.setIsAvailable(false);
        partnerRepository.save(partner);

        order.setDeliveryPartner(partner.getUser());
        order.setPartnerAssigned(true);
        orderRepository.save(order);

        log.info("Order {} accepted by partner {}", order.getId(), partnerId);

        // Notify customer
        notificationService.send(order.getCustomer().getId(),
                "Delivery Partner Assigned! 🛵",
                partner.getUser().getName() + " is on the way to pick up your order.",
                NotificationType.ORDER_UPDATE, order.getId());

        // Push notification to customer
        fcmService.sendToUser(order.getCustomer().getId(), "Delivery Partner Assigned!",
                partner.getUser().getName() + " will pick up your order soon.",
                Map.of("orderId", order.getId().toString(), "type", "DELIVERY_ASSIGNED"));

        // Broadcast WebSocket update
        broadcastAssignmentUpdate(order.getId(), "ASSIGNED", partner.getUser().getName());
    }

    /** Delivery partner rejects — find next candidate */
    @Transactional
    public void rejectAssignment(Long assignmentId, Long partnerId) {
        DeliveryAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", assignmentId));

        if (!assignment.getPartner().getUser().getId().equals(partnerId)) {
            throw new BusinessException("Assignment does not belong to this partner");
        }

        assignment.setStatus(AssignmentStatus.REJECTED);
        assignment.setRespondedAt(LocalDateTime.now());
        assignmentRepository.save(assignment);

        log.info("Order {} rejected by partner {}", assignment.getOrder().getId(), partnerId);

        // Try next candidate
        startAssignment(assignment.getOrder().getId());
    }

    /** Get the pending assignment request for the currently logged-in partner */
    public Optional<DeliveryAssignment> getPendingRequest(Long partnerId) {
        DeliveryPartner partner = partnerRepository.findByUserId(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryPartner for user", partnerId));
        return assignmentRepository.findByPartnerIdAndStatus(partner.getId(), AssignmentStatus.PENDING);
    }

    // ── Internal assignment logic ─────────────────────────────────────────────

    private void attemptAssignment(Order order, int attemptNumber) {
        if (attemptNumber > maxAttempts) {
            log.warn("Max assignment attempts reached for order {}. Admin must assign manually.", order.getId());
            notificationService.send(order.getCustomer().getId(),
                    "Finding Your Delivery Partner...",
                    "We're still looking for a nearby delivery partner. You'll be notified soon.",
                    NotificationType.ORDER_UPDATE, order.getId());
            return;
        }

        // Get address lat/lon — used as restaurant proxy for now
        Address address = order.getDeliveryAddress();
        Double refLat = address.getLatitude();
        Double refLon = address.getLatitude() != null ? address.getLongitude() : null;

        if (refLat == null || refLon == null) {
            log.warn("Order {} has no lat/lon. Assignment cannot use location. Assigning first available.", order.getId());
            assignFirstAvailable(order);
            return;
        }

        // Expand radius on each attempt
        double radius = Math.min(initialRadiusKm + (attemptNumber - 1) * radiusStepKm, maxRadiusKm);
        double[] box  = GeoUtil.boundingBox(refLat, refLon, radius);

        List<DeliveryPartner> candidates = partnerRepository.findAvailableInBoundingBox(
                box[0], box[1], box[2], box[3]);

        // Exclude already-attempted partners for this order
        Set<Long> alreadyOffered = assignmentRepository.findByOrderId(order.getId()).stream()
                .map(da -> da.getPartner().getId())
                .collect(Collectors.toSet());

        List<DeliveryPartner> eligible = candidates.stream()
                .filter(p -> !alreadyOffered.contains(p.getId()))
                .filter(p -> !assignmentRepository.partnerHasActiveAssignment(p.getId()))
                .toList();

        if (eligible.isEmpty()) {
            log.info("No eligible partners within {}km for order {}. Expanding...", radius, order.getId());
            if (radius < maxRadiusKm) {
                attemptAssignment(order, attemptNumber + 1);
            } else {
                log.warn("No partners found within max radius for order {}", order.getId());
            }
            return;
        }

        // Score and pick best candidate
        DeliveryPartner best = scoredSort(eligible, refLat, refLon).get(0);
        offerToPartner(order, best, refLat, refLon);
    }

    private void assignFirstAvailable(Order order) {
        List<DeliveryPartner> available = partnerRepository.findByIsOnlineTrueAndIsAvailableTrue();
        if (available.isEmpty()) {
            log.warn("No available partners at all for order {}", order.getId());
            return;
        }
        offerToPartner(order, available.get(0), 0.0, 0.0);
    }

    private void offerToPartner(Order order, DeliveryPartner partner, double refLat, double refLon) {
        double dist = (partner.getCurrentLatitude() != null && partner.getCurrentLongitude() != null)
                ? GeoUtil.haversineKm(refLat, refLon, partner.getCurrentLatitude(), partner.getCurrentLongitude())
                : 0.0;

        DeliveryAssignment assignment = DeliveryAssignment.builder()
                .order(order)
                .partner(partner)
                .status(AssignmentStatus.PENDING)
                .distanceKm(dist)
                .score(calculateScore(partner, dist))
                .timeoutSeconds(assignmentTimeoutSeconds)
                .build();
        assignmentRepository.save(assignment);

        log.info("Offered order {} to partner {} (dist={}km)", order.getId(), partner.getId(), String.format("%.2f", dist));

        // Send FCM push to delivery partner
        Long partnerUserId = partner.getUser().getId();
        int etaMinutes = GeoUtil.estimateTravelMinutes(dist, 25.0);

        fcmService.sendToUser(partnerUserId,
                "New Delivery Request 🛵",
                String.format("Order #%d — ₹%.0f — ~%d min away",
                        order.getId(), order.getTotalAmount().doubleValue(), etaMinutes),
                Map.of(
                        "type",         "DELIVERY_REQUEST",
                        "assignmentId", assignment.getId().toString(),
                        "orderId",      order.getId().toString(),
                        "distanceKm",   String.format("%.2f", dist),
                        "etaMinutes",   String.valueOf(etaMinutes)
                ));

        // Also WebSocket notification
        notificationService.send(partnerUserId, "New Delivery Request",
                "Order #" + order.getId() + " is waiting for pickup.",
                NotificationType.ORDER_UPDATE, order.getId());

        // Broadcast assignment event
        broadcastAssignmentUpdate(order.getId(), "OFFER_SENT", partner.getUser().getName());
    }

    /**
     * Score formula — lower is better.
     * Distance is weighted most heavily; rating improves score.
     */
    private double calculateScore(DeliveryPartner p, double distanceKm) {
        double distanceScore  = distanceKm * 40;   // km × weight
        double workloadScore  = p.getTodayDeliveries() * 2;
        double ratingBonus    = (5.0 - p.getRating().doubleValue()) * 5; // penalty for low rating
        return distanceScore + workloadScore + ratingBonus;
    }

    private List<DeliveryPartner> scoredSort(List<DeliveryPartner> candidates, double refLat, double refLon) {
        return candidates.stream()
                .sorted(Comparator.comparingDouble(p -> calculateScore(p,
                        (p.getCurrentLatitude() != null && p.getCurrentLongitude() != null)
                                ? GeoUtil.haversineKm(refLat, refLon, p.getCurrentLatitude(), p.getCurrentLongitude())
                                : 999.0)))
                .collect(Collectors.toList());
    }

    private void broadcastAssignmentUpdate(Long orderId, String event, String partnerName) {
        Map<String, Object> payload = Map.of(
                "orderId",     orderId,
                "event",       event,
                "partnerName", partnerName,
                "timestamp",   LocalDateTime.now().toString()
        );
        messagingTemplate.convertAndSend("/topic/orders/" + orderId, payload);
    }

    // ── Scheduled timeout checker ─────────────────────────────────────────────

    /**
     * Every 30 seconds — expire PENDING assignments that exceeded their timeout.
     */
    @Scheduled(fixedDelay = 30_000)
    @Transactional
    public void checkTimeouts() {
        LocalDateTime cutoff = LocalDateTime.now().minusSeconds(assignmentTimeoutSeconds);
        List<DeliveryAssignment> timedOut = assignmentRepository.findTimedOutAssignments(cutoff);

        for (DeliveryAssignment da : timedOut) {
            da.setStatus(AssignmentStatus.TIMED_OUT);
            da.setRespondedAt(LocalDateTime.now());
            assignmentRepository.save(da);

            log.info("Assignment {} timed out. Trying next partner for order {}.",
                    da.getId(), da.getOrder().getId());

            // Retry with next candidate
            startAssignment(da.getOrder().getId());
        }
    }
}
