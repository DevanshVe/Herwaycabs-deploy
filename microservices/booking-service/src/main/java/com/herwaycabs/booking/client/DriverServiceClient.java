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

    // Flip a driver busy (false) while on a trip, available (true) when free.
    @PostMapping("/api/drivers/{id}/availability")
    DriverDto updateAvailability(@PathVariable("id") Long id, @RequestParam("status") Boolean status);
}
