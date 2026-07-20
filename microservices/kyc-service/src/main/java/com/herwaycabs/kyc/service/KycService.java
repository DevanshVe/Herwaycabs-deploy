package com.herwaycabs.kyc.service;

import com.herwaycabs.kyc.model.Document;
import com.herwaycabs.kyc.model.DocumentStatus;
import com.herwaycabs.kyc.model.DocumentType;
import com.herwaycabs.kyc.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class KycService {

    private final DocumentRepository documentRepository;

    public Document uploadDocument(Long userId, String type, MultipartFile file) throws IOException {
        // Store bytes in the DB (durable) — the container filesystem is ephemeral.
        Document document = Document.builder()
                .userId(userId)
                .type(DocumentType.valueOf(type.toUpperCase()))
                .status(DocumentStatus.PENDING)
                .documentUrl(file.getOriginalFilename())
                .documentData(file.getBytes())
                .documentContentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                .uploadedAt(LocalDateTime.now())
                .build();

        return documentRepository.save(document);
    }

    public Document verifyDocument(Long documentId, Boolean approved, String notes) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        document.setStatus(approved ? DocumentStatus.APPROVED : DocumentStatus.REJECTED);
        document.setVerificationNotes(notes);
        document.setVerifiedAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    public List<Document> getUserDocuments(Long userId) {
        return documentRepository.findByUserId(userId);
    }

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    public List<Document> getPendingDocuments() {
        return documentRepository.findByStatus(DocumentStatus.PENDING);
    }

    public Document getDocument(Long documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
    }
}
