package com.herwaycabs.booking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "rides")
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Decoupled from User entity: Storing ID only
    private Long riderId;
    private Long driverId;

    @Enumerated(EnumType.STRING)
    private RideStatus status;

    private String pickupLocation;
    private Double pickupLatitude;
    private Double pickupLongitude;

    private String dropLocation;
    private Double dropLatitude;
    private Double dropLongitude;

    private Double fare;
    private LocalDateTime requestTime;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String otp;
}
