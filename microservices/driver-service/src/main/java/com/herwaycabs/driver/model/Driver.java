package com.herwaycabs.driver.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "drivers")
public class Driver {

    @Id
    private Long id; // Manually assigned from Auth Service User ID

    private String name;
    private String email;
    private String phoneNumber;
    private String gender;

    private Boolean isVerified;
    private Boolean isAvailable;

    private Double currentLatitude;
    private Double currentLongitude;

    private String documentPath;
}
