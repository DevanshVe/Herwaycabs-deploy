package com.herwaycabs.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Public, read-only view of a ride for the "share my ride" tracking link.
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackDto {
    private Long rideId;
    private String status;
    private String pickupLocation;
    private String dropLocation;
    private Double pickupLatitude;
    private Double pickupLongitude;
    private Double dropLatitude;
    private Double dropLongitude;
    private String driverName;
    private String driverVehicleModel;
    private String driverVehicleNumber;
    private Double driverLatitude;
    private Double driverLongitude;
}
