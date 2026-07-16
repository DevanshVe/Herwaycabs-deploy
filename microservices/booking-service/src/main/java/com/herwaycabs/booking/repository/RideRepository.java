package com.herwaycabs.booking.repository;

import com.herwaycabs.booking.model.Ride;
import com.herwaycabs.booking.model.RideStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RideRepository extends JpaRepository<Ride, Long> {
    List<Ride> findByRiderId(Long riderId);

    List<Ride> findByDriverId(Long driverId);

    List<Ride> findByStatus(RideStatus status);
}
