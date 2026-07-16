package com.herwaycabs.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DriverDto {
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String gender;
    private Boolean isAvailable;
    private Boolean isVerified;
}
