package com.cloudmeta.storage.service;

import java.io.InputStream;
import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.cloudmeta.storage.dto.file.DownloadUrlResponse;
import com.cloudmeta.storage.dto.file.FileResponse;

public interface FileService {

    FileResponse uploadFile(MultipartFile file, UUID folderId, String userEmail);

    List<FileResponse> getFiles(UUID folderId, String userEmail);

    List<FileResponse> getSharedFiles(String userEmail);

    FileResponse getFileById(UUID fileId, String userEmail);

    DownloadUrlResponse getDownloadUrl(UUID fileId, String userEmail);

    void softDeleteFile(UUID fileId, String userEmail);

    InputStream getFileInputStreamByKey(String storageKey, String shareToken, String userEmail);
}
