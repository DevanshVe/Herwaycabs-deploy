package com.cabbooking.booking;

import com.cabbooking.auth.User;
import com.cabbooking.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class BookingService {

    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final FareService fareService;

    public BookingService(RideRepository rideRepository, UserRepository userRepository, FareService fareService) {
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
        this.fareService = fareService;
    }

    public List<Ride> getAvailableRides() {
        return rideRepository.findAll().stream()
                .filter(ride -> ride.getStatus() == RideStatus.REQUESTED)
                .toList();
    }

    public Ride processPayment(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getStatus() != RideStatus.COMPLETED) {
            throw new RuntimeException("Ride not completed yet");
        }

        ride.setStatus(RideStatus.PAID);
        return rideRepository.save(ride);
    }

    public Ride requestRide(User rider, RideRequestDto request) {
        System.out.println("Request Ride DTO: " + request);
        double fare = fareService.calculateFare(
                request.getPickupLatitude(),
                request.getPickupLongitude(),
                request.getDropLatitude(),
                request.getDropLongitude());

        Ride ride = Ride.builder()
                .rider(rider)
                .status(RideStatus.REQUESTED)
                .pickupLocation(request.getPickupLocation())
                .pickupLatitude(request.getPickupLatitude())
                .pickupLongitude(request.getPickupLongitude())
                .dropLocation(request.getDropLocation())
                .dropLatitude(request.getDropLatitude())
                .dropLongitude(request.getDropLongitude())
                .fare(fare)
                .requestTime(LocalDateTime.now())
                .otp(String.format("%04d", new Random().nextInt(10000)))
                .build();

        return rideRepository.save(ride);
    }

    // Simple naive allocation: Find any available driver.
    // In real app, use geospatial query (PostGIS) to find nearest.
    public Ride assignDriver(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getStatus() != RideStatus.REQUESTED) {
            throw new RuntimeException("Ride is not in requested state");
        }

        // Find first available driver
        // Note: This is checking ALL users. In prod needs
        // "findByRoleAndIsAvailableAndIsVerified"
        // For MVP, lets filter in stream or use custom query
        // Efficient query using DB index
        User driver = userRepository.findAvailableDrivers().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No drivers available"));

        ride.setDriver(driver);
        ride.setStatus(RideStatus.DRIVER_ASSIGNED);
        return rideRepository.save(ride);
    }

    // Driver accepts ride via ID (or system assigns, here treating as system assign
    // triggered by something or driver accepting specific request)
    // Let's implement acceptRide for driver
    public Ride acceptRide(Long rideId, User driver) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
        if (ride.getStatus() != RideStatus.REQUESTED) {
            throw new RuntimeException("Ride already taken or cancelled");
        }
        ride.setDriver(driver);
        ride.setStatus(RideStatus.DRIVER_ASSIGNED);
        return rideRepository.save(ride);
    }

    public Ride startRide(Long rideId, String otp) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!ride.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        ride.setStatus(RideStatus.STARTED);
        ride.setStartTime(LocalDateTime.now());
        return rideRepository.save(ride);
    }

    public Ride completeRide(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        ride.setStatus(RideStatus.COMPLETED);
        ride.setEndTime(LocalDateTime.now());
        // Trigger payment logic here usually
        return rideRepository.save(ride);
    }

    public Ride cancelRide(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
        ride.setStatus(RideStatus.CANCELLED);
        return rideRepository.save(ride);
    }

    public List<Ride> getMyRides(User user) {
        if ("DRIVER".equals(user.getRole().name())) {
            return rideRepository.findByDriver(user);
        }
        return rideRepository.findByRider(user);
    }
}
