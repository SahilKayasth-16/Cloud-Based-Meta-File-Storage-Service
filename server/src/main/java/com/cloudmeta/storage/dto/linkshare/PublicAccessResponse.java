package com.cloudmeta.storage.dto.linkshare;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicAccessResponse {

    private String filename;
    private Long size;
    private String contentType;
    private LocalDateTime expiresAt;
    private boolean passwordRequired;
    private String downloadUrl;
}

