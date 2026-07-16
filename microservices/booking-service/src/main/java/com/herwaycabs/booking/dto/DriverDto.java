package com.herwaycabs.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverDto {
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private Boolean isAvailable;
    private Double currentLatitude;
    private Double currentLongitude;
}
