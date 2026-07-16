package com.herwaycabs.driver.repository;

import com.herwaycabs.driver.model.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, Long> {
    List<Driver> findByIsAvailableTrue();

    Optional<Driver> findByEmail(String email);

    List<Driver> findByIsAvailableTrueAndIsVerifiedTrue();

    List<Driver> findByIsVerifiedFalse();
}
