package com.cloudmeta.storage.dto.folder;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateFolderRequest {

    @NotBlank(message = "Folder name cannot be blank")
    private String name;
}

