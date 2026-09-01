package com.cloudmeta.storage.dto.linkshare;

import java.time.LocalDateTime;
import java.util.UUID;

import com.cloudmeta.storage.entity.LinkShare;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicLinkResponse {

    private UUID id;
    private UUID fileId;
    private String filename;
    private String token;
    private String publicUrl;
    private LocalDateTime expiresAt;
    private boolean isPasswordProtected;
    private boolean active;
    private LocalDateTime createdAt;

    public static PublicLinkResponse fromEntity(LinkShare linkShare, String baseUrl) {
        String url = (baseUrl != null ? baseUrl : "http://localhost:5173") + "/share/" + linkShare.getToken();
        return PublicLinkResponse.builder()
                .id(linkShare.getId())
                .fileId(linkShare.getFile().getId())
                .filename(linkShare.getFile().getFilename())
                .token(linkShare.getToken())
                .publicUrl(url)
                .expiresAt(linkShare.getExpiresAt())
                .isPasswordProtected(linkShare.getPasswordHash() != null && !linkShare.getPasswordHash().isBlank())
                .active(linkShare.isActive())
                .createdAt(linkShare.getCreatedAt())
                .build();
    }
}

