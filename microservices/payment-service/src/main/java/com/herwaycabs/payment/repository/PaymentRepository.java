package com.herwaycabs.payment.repository;

import com.herwaycabs.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByRideId(Long rideId);

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
}
