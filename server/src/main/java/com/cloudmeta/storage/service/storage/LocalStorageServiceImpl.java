package com.cloudmeta.storage.service.storage;

import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudmeta.storage.exception.StorageException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@ConditionalOnProperty(name = "storage.provider", havingValue = "local", matchIfMissing = true)
public class LocalStorageServiceImpl implements StorageService {

    private final Path rootLocation = Paths.get("uploads");

    public LocalStorageServiceImpl() {
        try {
            Files.createDirectories(rootLocation);
        } catch (Exception e) {
            log.error("Could not initialize local storage directory", e);
        }
    }

    @Override
    public String uploadFile(MultipartFile file, String storageKey) {
        try {
            Path targetPath = rootLocation.resolve(storageKey);
            Files.createDirectories(targetPath.getParent());
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("Successfully stored file locally at: {}", targetPath);
            return storageKey;
        } catch (Exception e) {
            log.error("Error storing file locally with key: {}", storageKey, e);
            throw new StorageException("Failed to store file locally: " + e.getMessage(), e);
        }
    }

    @Override
    public InputStream getFileInputStream(String storageKey) {
        try {
            Path targetPath = rootLocation.resolve(storageKey);
            return Files.newInputStream(targetPath);
        } catch (Exception e) {
            log.error("Error reading local file with key: {}", storageKey, e);
            throw new StorageException("Failed to read local file: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteFile(String storageKey) {
        try {
            Path targetPath = rootLocation.resolve(storageKey);
            Files.deleteIfExists(targetPath);
            log.info("Successfully deleted local file at: {}", targetPath);
        } catch (Exception e) {
            log.error("Error deleting local file with key: {}", storageKey, e);
            throw new StorageException("Failed to delete local file: " + e.getMessage(), e);
        }
    }

    @Override
    public String generateSignedDownloadUrl(String storageKey, int expirationSeconds) {
        try {
            String encodedKey = URLEncoder.encode(storageKey, StandardCharsets.UTF_8);
            return "http://localhost:8080/api/files/download-raw?key=" + encodedKey;
        } catch (Exception e) {
            log.error("Error generating local download URL for key: {}", storageKey, e);
            throw new StorageException("Failed to generate local download URL: " + e.getMessage(), e);
        }
    }
}
