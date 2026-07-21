package com.herwaycabs.booking.service;

import com.herwaycabs.booking.client.DriverServiceClient;
import com.herwaycabs.booking.dto.DriverDto;
import com.herwaycabs.booking.dto.DriverRatingDto;
import com.herwaycabs.booking.dto.RatingRequest;
import com.herwaycabs.booking.dto.RideRequestDto;
import com.herwaycabs.booking.model.CabType;
import com.herwaycabs.booking.model.Ride;
import com.herwaycabs.booking.model.RideStatus;
import com.herwaycabs.booking.repository.RideRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

    // Admin listing — every ride on the platform.
    public List<Ride> getAllRides() {
        return rideRepository.findAll();
    }

    public Ride requestRide(Long riderId, RideRequestDto request) {
        CabType cabType = parseCabType(request.getCabType());
        double fare = fareService.calculateFare(
                request.getPickupLatitude(),
                request.getPickupLongitude(),
                request.getDropLatitude(),
                request.getDropLongitude(),
                cabType);

        Ride ride = Ride.builder()
                .riderId(riderId)
                .status(RideStatus.REQUESTED)
                .cabType(cabType)
                .pickupLocation(request.getPickupLocation())
                .pickupLatitude(request.getPickupLatitude())
                .pickupLongitude(request.getPickupLongitude())
                .dropLocation(request.getDropLocation())
                .dropLatitude(request.getDropLatitude())
                .dropLongitude(request.getDropLongitude())
                .fare(fare)
                .requestTime(LocalDateTime.now())
                .otp(String.format("%04d", new Random().nextInt(10000)))
                .shareToken(java.util.UUID.randomUUID().toString().replace("-", ""))
                .build();

        Ride savedRide = rideRepository.save(ride);
        System.out.println("\n\n**************************************************************");
        System.out.println(">>> GENERATED OTP FOR RIDE " + savedRide.getId() + ": " + savedRide.getOtp() + " <<<");
        System.out.println("**************************************************************\n\n");
        return savedRide;
    }

    public Ride assignDriver(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ride not found"));

        if (ride.getStatus() != RideStatus.REQUESTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ride is not in requested state");
        }

        // Use Feign Client to find available driver
        DriverDto driver = driverServiceClient.getAvailableDrivers().stream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No drivers available"));

        ride.setDriverId(driver.getId());
        ride.setStatus(RideStatus.DRIVER_ASSIGNED);
        return rideRepository.save(ride);
    }

    public Ride acceptRide(Long rideId, Long driverId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ride not found"));
        if (ride.getStatus() != RideStatus.REQUESTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ride already taken or cancelled");
        }
        ride.setDriverId(driverId);
        ride.setStatus(RideStatus.DRIVER_ASSIGNED);
        Ride saved = rideRepository.save(ride);
        setDriverOnTrip(driverId, true); // busy while on this trip
        return saved;
    }

    public Ride startRide(Long rideId, String otp) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ride not found"));

        if (!ride.getOtp().equals(otp)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP");
        }

        ride.setStatus(RideStatus.STARTED);
        ride.setStartTime(LocalDateTime.now());
        return rideRepository.save(ride);
    }

    public Ride completeRide(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ride not found"));

        ride.setStatus(RideStatus.COMPLETED);
        ride.setEndTime(LocalDateTime.now());
        Ride saved = rideRepository.save(ride);
        setDriverOnTrip(ride.getDriverId(), false); // free to take new rides
        return saved;
    }

    public Ride payRide(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ride not found"));
        ride.setStatus(RideStatus.PAID);
        return rideRepository.save(ride);
    }

    public Ride cancelRide(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ride not found"));
        ride.setStatus(RideStatus.CANCELLED);
        Ride saved = rideRepository.save(ride);
        setDriverOnTrip(ride.getDriverId(), false); // free the driver if one was assigned
        return saved;
    }

    // Rider rates the driver for a finished ride (1-5 + optional note).
    public Ride rateRide(Long rideId, RatingRequest request) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ride not found"));
        if (ride.getStatus() != RideStatus.COMPLETED && ride.getStatus() != RideStatus.PAID) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You can only rate a completed ride.");
        }
        Integer rating = request.getRating();
        if (rating == null || rating < 1 || rating > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5.");
        }
        ride.setDriverRating(rating);
        ride.setDriverFeedback(request.getFeedback());
        return rideRepository.save(ride);
    }

    // Average rating (and count) for a driver, across all their rated rides.
    public DriverRatingDto getDriverRating(Long driverId) {
        List<Ride> rides = rideRepository.findByDriverId(driverId);
        long count = rides.stream().filter(r -> r.getDriverRating() != null).count();
        if (count == 0) {
            return DriverRatingDto.builder().average(null).count(0L).build();
        }
        double avg = rides.stream()
                .filter(r -> r.getDriverRating() != null)
                .mapToInt(Ride::getDriverRating)
                .average().orElse(0);
        return DriverRatingDto.builder()
                .average(Math.round(avg * 10.0) / 10.0)
                .count(count)
                .build();
    }

    public List<Ride> getMyRides(Long userId, String role) {
        if ("DRIVER".equalsIgnoreCase(role)) {
            return rideRepository.findByDriverId(userId);
        }
        return rideRepository.findByRiderId(userId);
    }

    private CabType parseCabType(String raw) {
        if (raw == null) return CabType.ECONOMY;
        try {
            return CabType.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return CabType.ECONOMY;
        }
    }

    // Best-effort flip of a driver's on-trip flag in driver-service. Never lets
    // a driver-service hiccup break the ride flow.
    private void setDriverOnTrip(Long driverId, boolean onTrip) {
        if (driverId == null) return;
        try {
            driverServiceClient.updateOnTrip(driverId, onTrip);
        } catch (Exception e) {
            System.err.println("Could not update driver on-trip status: " + e.getMessage());
        }
    }
}
