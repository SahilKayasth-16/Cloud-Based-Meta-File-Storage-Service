package com.cloudmeta.storage.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.cloudmeta.storage.dto.file.FileResponse;
import com.cloudmeta.storage.entity.File;
import com.cloudmeta.storage.entity.Folder;
import com.cloudmeta.storage.entity.User;
import com.cloudmeta.storage.exception.FileNotFoundException;
import com.cloudmeta.storage.exception.FolderNotFoundException;
import com.cloudmeta.storage.repository.FileRepository;
import com.cloudmeta.storage.repository.FolderRepository;
import com.cloudmeta.storage.repository.UserRepository;
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
    private final StorageService storageService;

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
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

            return fileRepository.findByOwnerIdAndFolderIdOrderByFilenameAsc(user.getId(), folderId)
                    .stream()
                    .map(FileResponse::fromEntity)
                    .toList();
        }

        return fileRepository.findByOwnerIdAndFolderIsNullOrderByFilenameAsc(user.getId())
                .stream()
                .map(FileResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FileResponse getFileById(UUID fileId, String userEmail) {
        User user = getUserByEmail(userEmail);

        File file = fileRepository.findByIdAndOwnerId(fileId, user.getId())
                .orElseThrow(() -> new FileNotFoundException("File not found"));

        return FileResponse.fromEntity(file);
    }

    @Override
    @Transactional
    public void deleteFile(UUID fileId, String userEmail) {
        User user = getUserByEmail(userEmail);

        File file = fileRepository.findByIdAndOwnerId(fileId, user.getId())
                .orElseThrow(() -> new FileNotFoundException("File not found"));

        // 1. Delete object from Object Storage
        storageService.deleteFile(file.getStorageKey());

        // 2. Delete metadata from PostgreSQL
        fileRepository.delete(file);
        log.info("Deleted file metadata from DB: id={}, filename={}", fileId, file.getFilename());
    }
}

