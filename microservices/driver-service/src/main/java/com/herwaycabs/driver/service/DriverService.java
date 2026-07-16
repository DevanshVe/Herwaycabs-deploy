package com.herwaycabs.driver.service;

import com.herwaycabs.driver.dto.LocationUpdateDto;
import com.herwaycabs.driver.model.Driver;
import com.herwaycabs.driver.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final String UPLOAD_DIR = "d:/CDAC/HerWayCabProject Folder/uploads/documents/";

    public Driver uploadDocument(Long driverId, org.springframework.web.multipart.MultipartFile file)
            throws java.io.IOException {
        Driver driver = getDriverById(driverId);
        java.io.File directory = new java.io.File(UPLOAD_DIR);
        if (!directory.exists()) {
            directory.mkdirs();
        }
        String fileName = driverId + "_" + file.getOriginalFilename();
        java.io.File dest = new java.io.File(UPLOAD_DIR + fileName);
        file.transferTo(dest);

        driver.setDocumentPath(dest.getAbsolutePath());
        return driverRepository.save(driver);
    }

    public byte[] getDocument(Long driverId) throws java.io.IOException {
        Driver driver = getDriverById(driverId);
        if (driver.getDocumentPath() == null) {
            throw new RuntimeException("No document found for this driver.");
        }
        return java.nio.file.Files.readAllBytes(java.nio.file.Paths.get(driver.getDocumentPath()));
    }

    public List<Driver> getAvailableDrivers() {
        return driverRepository.findByIsAvailableTrueAndIsVerifiedTrue();
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
