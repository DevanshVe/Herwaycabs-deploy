package com.herwaycabs.booking.controller;

import com.herwaycabs.booking.dto.RideRequestDto;
import com.herwaycabs.booking.model.Ride;
import com.herwaycabs.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/request")
    public ResponseEntity<Ride> requestRide(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody RideRequestDto request) {
        return ResponseEntity.ok(bookingService.requestRide(userId, request));
    }

    @GetMapping("/available")
    public ResponseEntity<List<Ride>> getAvailableRides() {
        return ResponseEntity.ok(bookingService.getAvailableRides());
    }

    @PostMapping("/{rideId}/assign")
    public ResponseEntity<Ride> assignDriver(@PathVariable Long rideId) {
        return ResponseEntity.ok(bookingService.assignDriver(rideId));
    }

    @PostMapping("/{rideId}/accept")
    public ResponseEntity<Ride> acceptRide(
            @PathVariable Long rideId,
            @RequestHeader("X-User-Id") Long driverId) {
        return ResponseEntity.ok(bookingService.acceptRide(rideId, driverId));
    }

    @PostMapping("/{rideId}/start")
    public ResponseEntity<Ride> startRide(
            @PathVariable Long rideId,
            @RequestParam String otp) {
        return ResponseEntity.ok(bookingService.startRide(rideId, otp));
    }

    @PostMapping("/{rideId}/complete")
    public ResponseEntity<Ride> completeRide(@PathVariable Long rideId) {
        return ResponseEntity.ok(bookingService.completeRide(rideId));
    }

    @PostMapping("/{rideId}/pay")
    public ResponseEntity<Ride> payRide(@PathVariable Long rideId) {
        return ResponseEntity.ok(bookingService.payRide(rideId));
    }

    @PostMapping("/{rideId}/cancel")
    public ResponseEntity<Ride> cancelRide(@PathVariable Long rideId) {
        return ResponseEntity.ok(bookingService.cancelRide(rideId));
    }

    @GetMapping("/my-rides")
    public ResponseEntity<List<Ride>> getMyRides(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "RIDER") String role) {
        return ResponseEntity.ok(bookingService.getMyRides(userId, role));
    }
}
