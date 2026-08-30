package com.cloudmeta.storage.dto.file;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DownloadUrlResponse {

    private String downloadUrl;

    @Builder.Default
    private int expiresIn = 300;
}

