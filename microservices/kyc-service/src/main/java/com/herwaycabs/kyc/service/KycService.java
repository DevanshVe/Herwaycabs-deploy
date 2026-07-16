package com.herwaycabs.kyc.service;

import com.herwaycabs.kyc.model.Document;
import com.herwaycabs.kyc.model.DocumentStatus;
import com.herwaycabs.kyc.model.DocumentType;
import com.herwaycabs.kyc.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KycService {

    private final DocumentRepository documentRepository;
    private final String UPLOAD_DIR = "uploads/";

    public Document uploadDocument(Long userId, String type, MultipartFile file) throws IOException {
        // Create upload directory if not exists
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Save file locally (In prod use S3/MinIO)
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        Document document = Document.builder()
                .userId(userId)
                .type(DocumentType.valueOf(type.toUpperCase()))
                .status(DocumentStatus.PENDING)
                .documentUrl(filePath.toString())
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
}
