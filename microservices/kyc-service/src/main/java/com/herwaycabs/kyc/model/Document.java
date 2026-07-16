package com.herwaycabs.kyc.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // Can be Rider or Driver

    @Enumerated(EnumType.STRING)
    private DocumentType type;

    @Enumerated(EnumType.STRING)
    private DocumentStatus status;

    private String documentUrl; // S3 or Storage URL
    private String verificationNotes;

    private LocalDateTime uploadedAt;
    private LocalDateTime verifiedAt;
}
