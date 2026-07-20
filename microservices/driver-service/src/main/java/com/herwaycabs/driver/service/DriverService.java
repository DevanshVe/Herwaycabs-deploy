package com.herwaycabs.driver.service;

import com.herwaycabs.driver.dto.LocationUpdateDto;
import com.herwaycabs.driver.model.Driver;
import com.herwaycabs.driver.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    @Value("${upload.dir:uploads/documents/}")
    private String uploadDir;

    public Driver uploadDocument(Long driverId, org.springframework.web.multipart.MultipartFile file)
            throws java.io.IOException {
        Driver driver = getDriverById(driverId);
        // Store the bytes in the DB (durable) instead of the ephemeral disk.
        driver.setDocumentData(file.getBytes());
        driver.setDocumentContentType(
                file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        driver.setDocumentPath(file.getOriginalFilename()); // marker that a document exists
        return driverRepository.save(driver);
    }

    public List<Driver> getAvailableDrivers() {
        // Online, verified, and not already on a trip.
        return driverRepository.findByIsAvailableTrueAndIsVerifiedTrue().stream()
                .filter(d -> !Boolean.TRUE.equals(d.getOnTrip()))
                .toList();
    }

    public Driver setOnTrip(Long driverId, Boolean onTrip) {
        Driver driver = getDriverById(driverId);
        driver.setOnTrip(onTrip);
        return driverRepository.save(driver);
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public Driver getDriverById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
    }

    public Driver updateLocation(Long driverId, LocationUpdateDto location) {
        Driver driver = getDriverById(driverId);
        driver.setCurrentLatitude(location.getLatitude());
        driver.setCurrentLongitude(location.getLongitude());
        return driverRepository.save(driver);
    }

    public Driver updateAvailability(Long driverId, Boolean isAvailable) {
        Driver driver = getDriverById(driverId);
        if (isAvailable && (driver.getIsVerified() == null || !driver.getIsVerified())) {
            throw new RuntimeException("Driver must be verified before going online.");
        }
        driver.setIsAvailable(isAvailable);
        return driverRepository.save(driver);
    }

    // Helper to create dummy driver for testing if not exists
    public Driver registerDriver(Driver driver) {
        return driverRepository.findByEmail(driver.getEmail())
                .orElseGet(() -> driverRepository.save(driver));
    }

    public List<Driver> getPendingDrivers() {
        return driverRepository.findByIsVerifiedFalse();
    }

    public Driver verifyDriver(Long driverId) {
        Driver driver = getDriverById(driverId);
        driver.setIsVerified(true);
        return driverRepository.save(driver);
    }
}
