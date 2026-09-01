package com.cloudmeta.storage.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cloudmeta.storage.entity.File;
import com.cloudmeta.storage.entity.Share;
import com.cloudmeta.storage.entity.ShareRole;
import com.cloudmeta.storage.entity.User;
import com.cloudmeta.storage.exception.FileNotFoundException;
import com.cloudmeta.storage.repository.FileRepository;
import com.cloudmeta.storage.repository.ShareRepository;
import com.cloudmeta.storage.repository.UserRepository;
import com.cloudmeta.storage.security.FilePermission;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final UserRepository userRepository;
    private final FileRepository fileRepository;
    private final ShareRepository shareRepository;

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private File getActiveFileById(UUID fileId) {
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new FileNotFoundException("File not found"));

        if (file.getDeletedAt() != null) {
            throw new FileNotFoundException("File has been deleted");
        }

        return file;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasPermission(User user, File file, FilePermission permission) {
        if (user == null || file == null || permission == null) {
            return false;
        }

        // Shared users cannot access soft-deleted files while in Trash
        if (file.getDeletedAt() != null && !file.getOwner().getId().equals(user.getId())) {
            return false;
        }

        // 1. OWNER has full access to all capabilities
        if (file.getOwner().getId().equals(user.getId())) {
            return true;
        }

        // 2. Resolve Share Role for non-owner
        Optional<Share> shareOpt = shareRepository.findByFileIdAndUserId(file.getId(), user.getId());
        if (shareOpt.isEmpty()) {
            return false;
        }

        ShareRole role = shareOpt.get().getRole();

        // 3. Evaluate capability hierarchy based on ShareRole
        switch (role) {
            case EDITOR:
                return permission == FilePermission.READ ||
                       permission == FilePermission.DOWNLOAD ||
                       permission == FilePermission.MODIFY ||
                       permission == FilePermission.DELETE;
            case VIEWER:
                return permission == FilePermission.READ ||
                       permission == FilePermission.DOWNLOAD;
            default:
                return false;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasPermission(String userEmail, UUID fileId, FilePermission permission) {
        User user = getUserByEmail(userEmail);
        File file = getActiveFileById(fileId);
        return hasPermission(user, file, permission);
    }

    @Override
    @Transactional(readOnly = true)
    public void requirePermission(User user, File file, FilePermission permission) {
        if (!hasPermission(user, file, permission)) {
            log.warn("Access denied for user {} on file {} for permission {}", user.getEmail(), file.getId(), permission);
            throw new AccessDeniedException("Access denied: You do not have " + permission + " permission on this file");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public void requirePermission(String userEmail, UUID fileId, FilePermission permission) {
        User user = getUserByEmail(userEmail);
        File file = getActiveFileById(fileId);
        requirePermission(user, file, permission);
    }
}

