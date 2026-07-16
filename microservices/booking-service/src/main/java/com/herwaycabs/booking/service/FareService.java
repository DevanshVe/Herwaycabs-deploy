package com.herwaycabs.booking.service;

import org.springframework.stereotype.Service;

@Service
public class FareService {

    private static final double BASE_FARE = 50.0;
    private static final double PER_KM_RATE = 15.0;

    public double calculateFare(double lat1, double lon1, double lat2, double lon2) {
        double distanceKm = calculateDistance(lat1, lon1, lat2, lon2);
        return Math.max(BASE_FARE, distanceKm * PER_KM_RATE);
    }

    // Haversine formula for distance
    //
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
