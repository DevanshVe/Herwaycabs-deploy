package com.herwaycabs.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RideRequestDto {
    private String pickupLocation;
    private Double pickupLatitude;
    private Double pickupLongitude;
    private String dropLocation;
    private Double dropLatitude;
    private Double dropLongitude;
}
