package com.cloudmeta.storage.dto.folder;

import java.time.LocalDateTime;
import java.util.UUID;

import com.cloudmeta.storage.entity.Folder;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FolderResponse {

    private UUID id;
    private String name;
    private UUID parentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static FolderResponse fromEntity(Folder folder) {
        return FolderResponse.builder()
                .id(folder.getId())
                .name(folder.getName())
                .parentId(folder.getParent() != null ? folder.getParent().getId() : null)
                .createdAt(folder.getCreatedAt())
                .updatedAt(folder.getUpdatedAt())
                .build();
    }
}

