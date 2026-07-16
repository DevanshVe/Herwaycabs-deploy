package com.herwaycabs.driver.controller;

import com.herwaycabs.driver.dto.LocationUpdateDto;
import com.herwaycabs.driver.model.Driver;
import com.herwaycabs.driver.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @GetMapping("/available")
    public ResponseEntity<List<Driver>> getAvailableDrivers() {
        return ResponseEntity.ok(driverService.getAvailableDrivers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Driver> getDriverById(@PathVariable Long id) {
        return ResponseEntity.ok(driverService.getDriverById(id));
    }

    @PostMapping("/{id}/location")
    public ResponseEntity<Driver> updateLocation(
            @PathVariable Long id,
            @RequestBody LocationUpdateDto location) {
        return ResponseEntity.ok(driverService.updateLocation(id, location));
    }

    @PostMapping("/{id}/availability")
    public ResponseEntity<Driver> updateAvailability(
            @PathVariable Long id,
            @RequestParam Boolean status) {
        return ResponseEntity.ok(driverService.updateAvailability(id, status));
    }

    // Backdoor for verifying/creating driver
    @PostMapping("/register")
    public ResponseEntity<Driver> registerDriver(@RequestBody Driver driver) {
        return ResponseEntity.ok(driverService.registerDriver(driver));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Driver>> getPendingDrivers() {
        return ResponseEntity.ok(driverService.getPendingDrivers());
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<Driver> verifyDriver(@PathVariable Long id) {
        return ResponseEntity.ok(driverService.verifyDriver(id));
    }

    @PostMapping("/{id}/document")
    public ResponseEntity<Driver> uploadDocument(@PathVariable Long id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        return ResponseEntity.ok(driverService.uploadDocument(id, file));
    }

    @GetMapping("/{id}/document")
    public ResponseEntity<byte[]> getDocument(@PathVariable Long id) throws java.io.IOException {
        byte[] image = driverService.getDocument(id);
        return ResponseEntity.ok().header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "image/jpeg").body(image);
    }
}
