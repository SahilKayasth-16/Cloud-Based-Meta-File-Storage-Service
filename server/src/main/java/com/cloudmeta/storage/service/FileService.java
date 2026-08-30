package com.cloudmeta.storage.service;

import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.cloudmeta.storage.dto.file.FileResponse;

public interface FileService {

    FileResponse uploadFile(MultipartFile file, UUID folderId, String userEmail);

    List<FileResponse> getFiles(UUID folderId, String userEmail);

    FileResponse getFileById(UUID fileId, String userEmail);

    void deleteFile(UUID fileId, String userEmail);
}

