package com.herwaycabs.booking.repository;

import com.herwaycabs.booking.model.SosEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SosEventRepository extends JpaRepository<SosEvent, Long> {
    List<SosEvent> findByStatusOrderByCreatedAtDesc(String status);
    List<SosEvent> findAllByOrderByCreatedAtDesc();
}
