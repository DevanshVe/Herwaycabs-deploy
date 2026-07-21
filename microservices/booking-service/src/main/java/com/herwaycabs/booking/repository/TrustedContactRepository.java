package com.herwaycabs.booking.repository;

import com.herwaycabs.booking.model.TrustedContact;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TrustedContactRepository extends JpaRepository<TrustedContact, Long> {
    List<TrustedContact> findByUserId(Long userId);
}
