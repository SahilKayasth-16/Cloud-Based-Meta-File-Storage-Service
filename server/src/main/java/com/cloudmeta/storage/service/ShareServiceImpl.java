package com.cloudmeta.storage.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cloudmeta.storage.dto.share.CreateShareRequest;
import com.cloudmeta.storage.dto.share.ShareResponse;
import com.cloudmeta.storage.entity.File;
import com.cloudmeta.storage.entity.Share;
import com.cloudmeta.storage.entity.User;
import com.cloudmeta.storage.exception.DuplicateShareException;
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
public class ShareServiceImpl implements ShareService {

    private final ShareRepository shareRepository;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final PermissionService permissionService;

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
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
    public ShareResponse createShare(CreateShareRequest request, String ownerEmail) {
        User owner = getUserByEmail(ownerEmail);
        File file = getActiveFile(request.getFileId());

        // 1. Authorize: Only OWNER has SHARE permission
        permissionService.requirePermission(owner, file, FilePermission.SHARE);

        // 2. Validate target user
        User targetUser = getUserByEmail(request.getEmail());
        if (targetUser.getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Cannot share a file with yourself");
        }

        // 3. Prevent duplicate shares (409 Conflict)
        if (shareRepository.existsByFileIdAndUserId(file.getId(), targetUser.getId())) {
            throw new DuplicateShareException("File is already shared with user: " + request.getEmail());
        }

        Share share = Share.builder()
                .file(file)
                .user(targetUser)
                .role(request.getRole())
                .build();

        Share savedShare = shareRepository.save(share);
        log.info("Created share: id={}, fileId={}, targetUser={}, role={}",
                savedShare.getId(), file.getId(), targetUser.getEmail(), request.getRole());

        return ShareResponse.fromEntity(savedShare);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShareResponse> getSharesForFile(UUID fileId, String ownerEmail) {
        User owner = getUserByEmail(ownerEmail);
        File file = getActiveFile(fileId);

        // Require SHARE permission to view share list
        permissionService.requirePermission(owner, file, FilePermission.SHARE);

        return shareRepository.findByFileId(file.getId())
                .stream()
                .map(ShareResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public void removeShare(UUID shareId, String ownerEmail) {
        User owner = getUserByEmail(ownerEmail);

        Share share = shareRepository.findById(shareId)
                .orElseThrow(() -> new FileNotFoundException("Share record not found"));

        // Require SHARE permission to revoke access
        permissionService.requirePermission(owner, share.getFile(), FilePermission.SHARE);

        shareRepository.delete(share);
        log.info("Revoked share id={} for file id={}", shareId, share.getFile().getId());
    }
}

