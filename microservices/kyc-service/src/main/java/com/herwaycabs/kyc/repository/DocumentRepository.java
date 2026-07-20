package com.herwaycabs.kyc.repository;

import com.herwaycabs.kyc.model.Document;
import com.herwaycabs.kyc.model.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByUserId(Long userId);

    List<Document> findByStatus(DocumentStatus status);
}
