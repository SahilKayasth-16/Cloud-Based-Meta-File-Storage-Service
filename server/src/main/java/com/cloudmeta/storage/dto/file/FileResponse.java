package com.cloudmeta.storage.dto.file;

import java.time.LocalDateTime;
import java.util.UUID;

import com.cloudmeta.storage.entity.File;
import com.cloudmeta.storage.entity.ShareRole;

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
    private String ownerEmail;
    private String ownerName;
    private ShareRole sharedRole;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static FileResponse fromEntity(File file) {
        if (file == null) return null;
        return FileResponse.builder()
                .id(file.getId())
                .filename(file.getFilename())
                .size(file.getSize())
                .contentType(file.getContentType())
                .folderId(file.getFolder() != null ? file.getFolder().getId() : null)
                .ownerEmail(file.getOwner() != null ? file.getOwner().getEmail() : null)
                .ownerName(file.getOwner() != null ? file.getOwner().getName() : null)
                .createdAt(file.getCreatedAt())
                .updatedAt(file.getUpdatedAt())
                .build();
    }

    public static FileResponse fromEntityWithRole(File file, ShareRole role) {
        FileResponse response = fromEntity(file);
        if (response != null) {
            response.setSharedRole(role);
        }
        return response;
    }
}
