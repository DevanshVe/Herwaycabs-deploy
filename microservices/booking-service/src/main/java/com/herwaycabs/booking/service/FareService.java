package com.herwaycabs.booking.service;

import com.herwaycabs.booking.model.CabType;
import org.springframework.stereotype.Service;

@Service
public class FareService {

    // Per cab-type pricing: { base fare, per-km rate }.
    private double baseFare(CabType type) {
        return type == CabType.LUXURY ? 100.0 : 50.0;
    }

    private double perKmRate(CabType type) {
        return type == CabType.LUXURY ? 28.0 : 15.0;
    }

    public double calculateFare(double lat1, double lon1, double lat2, double lon2, CabType type) {
        CabType t = (type == null) ? CabType.ECONOMY : type;
        double distanceKm = calculateDistance(lat1, lon1, lat2, lon2);
        double fare = Math.max(baseFare(t), distanceKm * perKmRate(t));
        return Math.round(fare); // whole rupees — no long decimals on the UI
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
