package com.spiceroute.delivery.util;

/**
 * Geographic calculation utilities.
 * All methods are pure functions — no Spring beans required.
 */
public final class GeoUtil {

    private static final double EARTH_RADIUS_KM = 6371.0;

    private GeoUtil() {}

    /**
     * Haversine distance between two points on Earth.
     *
     * @return distance in kilometres
     */
    public static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
    }

    /**
     * Rough bounding box around a centre point for initial DB filtering.
     * Returns [minLat, maxLat, minLon, maxLon].
     */
    public static double[] boundingBox(double lat, double lon, double radiusKm) {
        double latDelta = radiusKm / 111.0;        // ~111 km per degree latitude
        double lonDelta = radiusKm / (111.0 * Math.cos(Math.toRadians(lat)));
        return new double[]{lat - latDelta, lat + latDelta, lon - lonDelta, lon + lonDelta};
    }

    /**
     * Estimated travel time in minutes at a given average speed.
     *
     * @param distanceKm  distance in km
     * @param avgSpeedKmh average speed (default ~25 km/h for city bike)
     */
    public static int estimateTravelMinutes(double distanceKm, double avgSpeedKmh) {
        return (int) Math.ceil((distanceKm / avgSpeedKmh) * 60);
    }
}
