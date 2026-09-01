package com.cloudmeta.storage.dto.linkshare;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePublicLinkRequest {

    @NotNull(message = "File ID is required")
    private UUID fileId;

    private LocalDateTime expiresAt;

    private String password;
}

