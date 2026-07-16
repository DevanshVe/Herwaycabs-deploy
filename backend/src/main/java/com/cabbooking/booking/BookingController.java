package com.cabbooking.booking;

import com.cabbooking.auth.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/request")
    public ResponseEntity<Ride> requestRide(
            @AuthenticationPrincipal User user,
            @RequestBody RideRequestDto request) {
        return ResponseEntity.ok(bookingService.requestRide(user, request));
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
            @AuthenticationPrincipal User driver) {
        return ResponseEntity.ok(bookingService.acceptRide(rideId, driver));
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
    public ResponseEntity<Ride> payForRide(@PathVariable Long rideId) {
        return ResponseEntity.ok(bookingService.processPayment(rideId));
    }

    @PostMapping("/{rideId}/cancel")
    public ResponseEntity<Ride> cancelRide(@PathVariable Long rideId) {
        return ResponseEntity.ok(bookingService.cancelRide(rideId));
    }

    @GetMapping("/my-rides")
    public ResponseEntity<List<Ride>> getMyRides(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.getMyRides(user));
    }
}
