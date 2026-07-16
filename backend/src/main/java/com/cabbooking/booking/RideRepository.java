package com.cabbooking.booking;

import com.cabbooking.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RideRepository extends JpaRepository<Ride, Long> {
    List<Ride> findByRider(User rider);

    List<Ride> findByDriver(User driver);

    List<Ride> findByStatus(RideStatus status);
}
