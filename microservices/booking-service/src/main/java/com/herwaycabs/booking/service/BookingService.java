package com.herwaycabs.booking.service;

import com.herwaycabs.booking.client.DriverServiceClient;
import com.herwaycabs.booking.dto.DriverDto;
import com.herwaycabs.booking.dto.RideRequestDto;
import com.herwaycabs.booking.model.Ride;
import com.herwaycabs.booking.model.RideStatus;
import com.herwaycabs.booking.repository.RideRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final RideRepository rideRepository;
    private final FareService fareService;
    private final DriverServiceClient driverServiceClient;

    public List<Ride> getAvailableRides() {
        return rideRepository.findByStatus(RideStatus.REQUESTED);
    }

    public Ride requestRide(Long riderId, RideRequestDto request) {
        double fare = fareService.calculateFare(
                request.getPickupLatitude(),
                request.getPickupLongitude(),
                request.getDropLatitude(),
                request.getDropLongitude());

        Ride ride = Ride.builder()
                .riderId(riderId)
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

        Ride savedRide = rideRepository.save(ride);
        System.out.println("\n\n**************************************************************");
        System.out.println(">>> GENERATED OTP FOR RIDE " + savedRide.getId() + ": " + savedRide.getOtp() + " <<<");
        System.out.println("**************************************************************\n\n");
        return savedRide;
    }

    public Ride assignDriver(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getStatus() != RideStatus.REQUESTED) {
            throw new RuntimeException("Ride is not in requested state");
        }

        // Use Feign Client to find available driver
        DriverDto driver = driverServiceClient.getAvailableDrivers().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No drivers available"));

        ride.setDriverId(driver.getId());
        ride.setStatus(RideStatus.DRIVER_ASSIGNED);
        return rideRepository.save(ride);
    }

    public Ride acceptRide(Long rideId, Long driverId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
        if (ride.getStatus() != RideStatus.REQUESTED) {
            throw new RuntimeException("Ride already taken or cancelled");
        }
        ride.setDriverId(driverId);
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
        ride.setStatus(RideStatus.COMPLETED);
        ride.setEndTime(LocalDateTime.now());
        return rideRepository.save(ride);
    }

    public Ride payRide(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
        ride.setStatus(RideStatus.PAID);
        return rideRepository.save(ride);
    }

    public Ride cancelRide(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
        ride.setStatus(RideStatus.CANCELLED);
        return rideRepository.save(ride);
    }

    public List<Ride> getMyRides(Long userId, String role) {
        if ("DRIVER".equalsIgnoreCase(role)) {
            return rideRepository.findByDriverId(userId);
        }
        return rideRepository.findByRiderId(userId);
    }
}
