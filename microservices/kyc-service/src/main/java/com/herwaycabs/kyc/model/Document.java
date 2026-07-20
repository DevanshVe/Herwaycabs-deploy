package com.herwaycabs.kyc.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

    private String documentUrl; // original filename (marker that a file exists)
    private String verificationNotes;

    private LocalDateTime uploadedAt;
    private LocalDateTime verifiedAt;

    // Document bytes stored in the DB (Neon) so they survive redeploys — the
    // container filesystem on Render is ephemeral. Not serialized in JSON
    // responses (served raw via the /{id}/file endpoint instead).
    @JsonIgnore
    @Column(columnDefinition = "bytea")
    private byte[] documentData;
    private String documentContentType;
}
