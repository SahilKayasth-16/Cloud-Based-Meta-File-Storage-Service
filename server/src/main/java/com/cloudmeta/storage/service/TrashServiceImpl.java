package com.cloudmeta.storage.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cloudmeta.storage.dto.file.FileResponse;
import com.cloudmeta.storage.entity.File;
import com.cloudmeta.storage.entity.User;
import com.cloudmeta.storage.exception.FileNotFoundException;
import com.cloudmeta.storage.repository.FileRepository;
import com.cloudmeta.storage.repository.FolderRepository;
import com.cloudmeta.storage.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrashServiceImpl implements TrashService {

    private final FileRepository fileRepository;
    private final FolderRepository folderRepository;
    private final UserRepository userRepository;

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FileResponse> getTrashFiles(String userEmail) {
        User user = getUserByEmail(userEmail);
        List<File> deletedFiles = fileRepository.findByOwnerIdAndDeletedAtIsNotNullOrderByDeletedAtDesc(user.getId());

        return deletedFiles.stream()
                .map(FileResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public FileResponse restoreFile(UUID fileId, String userEmail) {
        User user = getUserByEmail(userEmail);
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new FileNotFoundException("File not found"));

        // 1. Authorize: ONLY the file OWNER can restore the file (Viewers & Editors -> 403 Forbidden)
        if (!file.getOwner().getId().equals(user.getId())) {
            log.warn("User {} attempted to restore file {} owned by {}", userEmail, fileId, file.getOwner().getEmail());
            throw new AccessDeniedException("Only the file owner can restore this file");
        }

        // 2. File already active check
        if (file.getDeletedAt() == null) {
            log.info("File id={} is already active", fileId);
            return FileResponse.fromEntity(file);
        }

        // 3. Parent folder deleted edge case: If parent folder no longer exists in DB, move restored file to root
        if (file.getFolder() != null && !folderRepository.existsById(file.getFolder().getId())) {
            log.info("Parent folder id={} no longer exists. Restoring file id={} to root folder.", file.getFolder().getId(), fileId);
            file.setFolder(null);
        }

        // 4. Restore file by clearing deletedAt
        file.setDeletedAt(null);
        File savedFile = fileRepository.save(file);
        log.info("Restored file id={}, filename={} for user={}", savedFile.getId(), savedFile.getFilename(), userEmail);

        return FileResponse.fromEntity(savedFile);
    }
}

