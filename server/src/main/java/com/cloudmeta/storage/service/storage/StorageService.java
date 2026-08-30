package com.cloudmeta.storage.service.storage;

import java.io.InputStream;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    String uploadFile(MultipartFile file, String storageKey);

    InputStream getFileInputStream(String storageKey);

    void deleteFile(String storageKey);

    String generateSignedDownloadUrl(String storageKey, int expirationSeconds);
}
