package com.cloudmeta.storage.service;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.cloudmeta.storage.dto.file.DownloadUrlResponse;
import com.cloudmeta.storage.dto.file.FileResponse;
import com.cloudmeta.storage.entity.File;
import com.cloudmeta.storage.entity.Folder;
import com.cloudmeta.storage.entity.User;
import com.cloudmeta.storage.exception.FileNotFoundException;
import com.cloudmeta.storage.exception.FolderNotFoundException;
import com.cloudmeta.storage.entity.Share;
import com.cloudmeta.storage.repository.FileRepository;
import com.cloudmeta.storage.repository.FolderRepository;
import com.cloudmeta.storage.repository.ShareRepository;
import com.cloudmeta.storage.repository.UserRepository;
import com.cloudmeta.storage.security.FilePermission;
import com.cloudmeta.storage.service.storage.StorageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    private final FileRepository fileRepository;
    private final FolderRepository folderRepository;
    private final UserRepository userRepository;
    private final ShareRepository shareRepository;
    private final StorageService storageService;
    private final PermissionService permissionService;

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private File getActiveFile(UUID fileId) {
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new FileNotFoundException("File not found"));
        if (file.getDeletedAt() != null) {
            throw new FileNotFoundException("File has been deleted");
        }
        return file;
    }

    @Override
    @Transactional
    public FileResponse uploadFile(MultipartFile file, UUID folderId, String userEmail) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file");
        }

        User user = getUserByEmail(userEmail);
        Folder folder = null;

        if (folderId != null) {
            folder = folderRepository.findByIdAndOwnerId(folderId, user.getId())
                    .orElseThrow(() -> new FolderNotFoundException("Parent folder not found"));
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed_file";
        String storageKey = "users/" + user.getId() + "/" + UUID.randomUUID() + "_" + originalFilename;

        // 1. Upload actual file bytes to Object Storage
        storageService.uploadFile(file, storageKey);

        // 2. Persist ONLY metadata in PostgreSQL
        File fileEntity = File.builder()
                .filename(originalFilename)
                .size(file.getSize())
                .contentType(file.getContentType())
                .storageKey(storageKey)
                .folder(folder)
                .owner(user)
                .build();

        File savedFile = fileRepository.save(fileEntity);
        log.info("Saved file metadata in DB: id={}, filename={}, key={}", savedFile.getId(), originalFilename, storageKey);

        return FileResponse.fromEntity(savedFile);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FileResponse> getFiles(UUID folderId, String userEmail) {
        User user = getUserByEmail(userEmail);

        if (folderId != null) {
            folderRepository.findByIdAndOwnerId(folderId, user.getId())
                    .orElseThrow(() -> new FolderNotFoundException("Parent folder not found"));

            return fileRepository.findByOwnerIdAndFolderIdAndDeletedAtIsNullOrderByFilenameAsc(user.getId(), folderId)
                    .stream()
                    .map(FileResponse::fromEntity)
                    .toList();
        }

        return fileRepository.findByOwnerIdAndFolderIsNullAndDeletedAtIsNullOrderByFilenameAsc(user.getId())
                .stream()
                .map(FileResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FileResponse> getSharedFiles(String userEmail) {
        User user = getUserByEmail(userEmail);
        List<Share> shares = shareRepository.findByUserId(user.getId());

        return shares.stream()
                .filter(share -> share.getFile() != null && share.getFile().getDeletedAt() == null)
                .map(share -> FileResponse.fromEntityWithRole(share.getFile(), share.getRole()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FileResponse getFileById(UUID fileId, String userEmail) {
        User user = getUserByEmail(userEmail);
        File file = getActiveFile(fileId);

        // Require READ permission via PermissionEngine
        permissionService.requirePermission(user, file, FilePermission.READ);

        return FileResponse.fromEntity(file);
    }

    @Override
    @Transactional(readOnly = true)
    public DownloadUrlResponse getDownloadUrl(UUID fileId, String userEmail) {
        User user = getUserByEmail(userEmail);
        File file = getActiveFile(fileId);

        // Require DOWNLOAD permission via PermissionEngine
        permissionService.requirePermission(user, file, FilePermission.DOWNLOAD);

        String downloadUrl = storageService.generateSignedDownloadUrl(file.getStorageKey(), 300);
        log.info("Generated download URL for file id={}, user={}", fileId, userEmail);

        return DownloadUrlResponse.builder()
                .downloadUrl(downloadUrl)
                .expiresIn(300)
                .build();
    }

    @Override
    @Transactional
    public void softDeleteFile(UUID fileId, String userEmail) {
        User user = getUserByEmail(userEmail);
        File file = getActiveFile(fileId);

        // Require DELETE permission via PermissionEngine
        permissionService.requirePermission(user, file, FilePermission.DELETE);

        // SOFT DELETE: Set deletedAt timestamp, do NOT physically delete object from Storage
        file.setDeletedAt(LocalDateTime.now());
        fileRepository.save(file);
        log.info("Soft deleted file id={}, filename={} in PostgreSQL", fileId, file.getFilename());
    }

    @Override
    @Transactional(readOnly = true)
    public InputStream getFileInputStreamByKey(String storageKey, String userEmail) {
        User user = getUserByEmail(userEmail);
        String userPrefix = "users/" + user.getId() + "/";
        if (!storageKey.startsWith(userPrefix)) {
            // Check if user has permission to any file with this storageKey
            File file = fileRepository.findAll().stream()
                    .filter(f -> storageKey.equals(f.getStorageKey()))
                    .findFirst()
                    .orElseThrow(() -> new FileNotFoundException("Access denied to requested storage key"));
            permissionService.requirePermission(user, file, FilePermission.DOWNLOAD);
        }
        return storageService.getFileInputStream(storageKey);
    }
}
