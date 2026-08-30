package com.cloudmeta.storage.dto.file;

import java.time.LocalDateTime;
import java.util.UUID;

import com.cloudmeta.storage.entity.File;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileResponse {

    private UUID id;
    private String filename;
    private Long size;
    private String contentType;
    private UUID folderId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static FileResponse fromEntity(File file) {
        return FileResponse.builder()
                .id(file.getId())
                .filename(file.getFilename())
                .size(file.getSize())
                .contentType(file.getContentType())
                .folderId(file.getFolder() != null ? file.getFolder().getId() : null)
                .createdAt(file.getCreatedAt())
                .updatedAt(file.getUpdatedAt())
                .build();
    }
}

