package com.herwaycabs.booking.controller;

import com.herwaycabs.booking.dto.SosRequest;
import com.herwaycabs.booking.dto.TrackDto;
import com.herwaycabs.booking.model.SosEvent;
import com.herwaycabs.booking.model.TrustedContact;
import com.herwaycabs.booking.service.SafetyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/safety")
@RequiredArgsConstructor
public class SafetyController {

    private final SafetyService safetyService;

    // --- Trusted contacts (rider) ---
    @PostMapping("/contacts")
    public ResponseEntity<TrustedContact> addContact(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody TrustedContact contact) {
        return ResponseEntity.ok(safetyService.addContact(userId, contact));
    }

    @GetMapping("/contacts")
    public ResponseEntity<List<TrustedContact>> getContacts(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(safetyService.getContacts(userId));
    }

    @DeleteMapping("/contacts/{id}")
    public ResponseEntity<Void> deleteContact(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {
        safetyService.deleteContact(userId, id);
        return ResponseEntity.noContent().build();
    }

    // --- SOS ---
    @PostMapping("/sos")
    public ResponseEntity<SosEvent> raiseSos(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody SosRequest request) {
        return ResponseEntity.ok(safetyService.createSos(userId, request));
    }

    @GetMapping("/sos/active")
    public ResponseEntity<List<SosEvent>> activeSos() {
        return ResponseEntity.ok(safetyService.getActiveSos());
    }

    @GetMapping("/sos/all")
    public ResponseEntity<List<SosEvent>> allSos() {
        return ResponseEntity.ok(safetyService.getAllSos());
    }

    @PostMapping("/sos/{id}/resolve")
    public ResponseEntity<SosEvent> resolveSos(@PathVariable Long id) {
        return ResponseEntity.ok(safetyService.resolveSos(id));
    }

    // --- Public ride tracking (no auth) ---
    @GetMapping("/track/{token}")
    public ResponseEntity<TrackDto> track(@PathVariable String token) {
        return ResponseEntity.ok(safetyService.track(token));
    }
}
