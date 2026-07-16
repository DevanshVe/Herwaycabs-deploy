package com.cabbooking.location;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class LocationController {

    public LocationController() {
    }

    // Drivers send location updates to /app/driver-location
    // Subscribers (Riders) listen to /topic/driver-location
    @MessageMapping("/driver-location")
    @SendTo("/topic/driver-location")
    public LocationUpdate updateLocation(@Payload LocationUpdate location) {
        // Here we can also save to Redis for latest state
        return location;
    }
}
