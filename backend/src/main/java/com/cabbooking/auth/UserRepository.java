package com.cabbooking.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.role = 'DRIVER' AND u.isAvailable = true AND u.isVerified = true")
    java.util.List<User> findAvailableDrivers();
}
