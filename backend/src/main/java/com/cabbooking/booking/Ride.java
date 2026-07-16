package com.cabbooking.booking;

import com.cabbooking.auth.User;
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
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User rider;

    @ManyToOne
    private User driver;

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
