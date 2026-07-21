package com.herwaycabs.booking.service;

import com.herwaycabs.booking.client.DriverServiceClient;
import com.herwaycabs.booking.dto.DriverDto;
import com.herwaycabs.booking.dto.SosRequest;
import com.herwaycabs.booking.dto.TrackDto;
import com.herwaycabs.booking.model.Ride;
import com.herwaycabs.booking.model.SosEvent;
import com.herwaycabs.booking.model.TrustedContact;
import com.herwaycabs.booking.repository.RideRepository;
import com.herwaycabs.booking.repository.SosEventRepository;
import com.herwaycabs.booking.repository.TrustedContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SafetyService {

    private final TrustedContactRepository contactRepo;
    private final SosEventRepository sosRepo;
    private final RideRepository rideRepo;
    private final DriverServiceClient driverServiceClient;

    // --- Trusted contacts ---
    public TrustedContact addContact(Long userId, TrustedContact c) {
        c.setId(null);
        c.setUserId(userId);
        return contactRepo.save(c);
    }

    public List<TrustedContact> getContacts(Long userId) {
        return contactRepo.findByUserId(userId);
    }

    public void deleteContact(Long userId, Long id) {
        contactRepo.findById(id)
                .filter(c -> c.getUserId().equals(userId))
                .ifPresent(contactRepo::delete);
    }

    // --- SOS ---
    public SosEvent createSos(Long userId, SosRequest req) {
        SosEvent e = SosEvent.builder()
                .userId(userId)
                .rideId(req.getRideId())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .status("ACTIVE")
                .note(req.getNote())
                .createdAt(LocalDateTime.now())
                .build();
        return sosRepo.save(e);
    }

    public List<SosEvent> getActiveSos() {
        return sosRepo.findByStatusOrderByCreatedAtDesc("ACTIVE");
    }

    public List<SosEvent> getAllSos() {
        return sosRepo.findAllByOrderByCreatedAtDesc();
    }

    public SosEvent resolveSos(Long id) {
        SosEvent e = sosRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SOS event not found"));
        e.setStatus("RESOLVED");
        e.setResolvedAt(LocalDateTime.now());
        return sosRepo.save(e);
    }

    // --- Public ride tracking ---
    public TrackDto track(String token) {
        Ride ride = rideRepo.findByShareToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "This tracking link is invalid or has expired."));

        TrackDto.TrackDtoBuilder b = TrackDto.builder()
                .rideId(ride.getId())
                .status(ride.getStatus() == null ? null : ride.getStatus().name())
                .pickupLocation(ride.getPickupLocation())
                .dropLocation(ride.getDropLocation())
                .pickupLatitude(ride.getPickupLatitude())
                .pickupLongitude(ride.getPickupLongitude())
                .dropLatitude(ride.getDropLatitude())
                .dropLongitude(ride.getDropLongitude());

        if (ride.getDriverId() != null) {
            try {
                DriverDto d = driverServiceClient.getDriverById(ride.getDriverId());
                b.driverName(d.getName())
                        .driverVehicleModel(d.getVehicleModel())
                        .driverVehicleNumber(d.getVehicleNumber())
                        .driverLatitude(d.getCurrentLatitude())
                        .driverLongitude(d.getCurrentLongitude());
            } catch (Exception ignored) {
                // driver-service momentarily unavailable — return ride info only
            }
        }
        return b.build();
    }
}
