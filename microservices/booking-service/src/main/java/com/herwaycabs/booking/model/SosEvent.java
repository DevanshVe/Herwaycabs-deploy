package com.herwaycabs.booking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sos_events")
public class SosEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long rideId;
    private Double latitude;
    private Double longitude;
    private String status; // ACTIVE / RESOLVED
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
