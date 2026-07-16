package com.herwaycabs.auth.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.herwaycabs.auth.dto.DriverDto;

@FeignClient(name = "DRIVER-SERVICE")
public interface DriverServiceClient {
    @PostMapping("/api/drivers/register")
    void registerDriver(@RequestBody DriverDto driver);
}
