package com.herwaycabs.kyc.controller;

import com.herwaycabs.kyc.model.Document;
import com.herwaycabs.kyc.service.KycService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
public class KycController {

    private final KycService kycService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Document> uploadDocument(
            @RequestParam("userId") Long userId,
            @RequestParam("type") String type,
            @RequestPart("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(kycService.uploadDocument(userId, type, file));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{documentId}/verify")
    public ResponseEntity<Document> verifyDocument(
            @PathVariable Long documentId,
            @RequestParam Boolean approved,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(kycService.verifyDocument(documentId, approved, notes));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Document>> getUserDocuments(@PathVariable Long userId) {
        return ResponseEntity.ok(kycService.getUserDocuments(userId));
    }
}
