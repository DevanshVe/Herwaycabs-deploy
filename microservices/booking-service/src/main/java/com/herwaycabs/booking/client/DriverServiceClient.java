package com.herwaycabs.booking.client;

import com.herwaycabs.booking.dto.DriverDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "DRIVER-SERVICE")
public interface DriverServiceClient {

    @GetMapping("/api/drivers/available")
    List<DriverDto> getAvailableDrivers();

    @GetMapping("/api/drivers/{id}")
    DriverDto getDriverById(@PathVariable("id") Long id);

    // Flag a driver on (true) / off (false) an active trip.
    @PostMapping("/api/drivers/{id}/on-trip")
    DriverDto updateOnTrip(@PathVariable("id") Long id, @RequestParam("status") Boolean status);
}
