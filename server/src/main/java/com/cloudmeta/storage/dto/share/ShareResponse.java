package com.cloudmeta.storage.dto.share;

import java.time.LocalDateTime;
import java.util.UUID;

import com.cloudmeta.storage.entity.Share;
import com.cloudmeta.storage.entity.ShareRole;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShareResponse {

    private UUID id;
    private UUID fileId;
    private String filename;
    private UUID userId;
    private String userEmail;
    private String userName;
    private ShareRole role;
    private LocalDateTime createdAt;

    public static ShareResponse fromEntity(Share share) {
        return ShareResponse.builder()
                .id(share.getId())
                .fileId(share.getFile().getId())
                .filename(share.getFile().getFilename())
                .userId(share.getUser().getId())
                .userEmail(share.getUser().getEmail())
                .userName(share.getUser().getName())
                .role(share.getRole())
                .createdAt(share.getCreatedAt())
                .build();
    }
}

