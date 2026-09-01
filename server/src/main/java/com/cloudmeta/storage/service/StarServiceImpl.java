package com.cloudmeta.storage.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cloudmeta.storage.dto.file.FileResponse;
import com.cloudmeta.storage.entity.File;
import com.cloudmeta.storage.entity.Star;
import com.cloudmeta.storage.entity.User;
import com.cloudmeta.storage.exception.FileNotFoundException;
import com.cloudmeta.storage.repository.FileRepository;
import com.cloudmeta.storage.repository.StarRepository;
import com.cloudmeta.storage.repository.UserRepository;
import com.cloudmeta.storage.security.FilePermission;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class StarServiceImpl implements StarService {

    private final StarRepository starRepository;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final PermissionService permissionService;

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private File getActiveFile(UUID fileId) {
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new FileNotFoundException("File not found"));
        if (file.getDeletedAt() != null) {
            throw new FileNotFoundException("Cannot star a deleted file");
        }
        return file;
    }

    @Override
    @Transactional
    public void starFile(UUID fileId, String userEmail) {
        User user = getUserByEmail(userEmail);
        File file = getActiveFile(fileId);

        // Require READ permission via PermissionEngine
        permissionService.requirePermission(user, file, FilePermission.READ);

        // Prevent duplicate stars for same (user, file)
        if (starRepository.existsByUserIdAndFileId(user.getId(), file.getId())) {
            log.info("File id={} is already starred by user={}", fileId, userEmail);
            return;
        }

        Star star = Star.builder()
                .user(user)
                .file(file)
                .build();

        starRepository.save(star);
        log.info("Starred file id={} for user={}", fileId, userEmail);
    }

    @Override
    @Transactional
    public void unstarFile(UUID fileId, String userEmail) {
        User user = getUserByEmail(userEmail);
        starRepository.deleteByUserIdAndFileId(user.getId(), fileId);
        log.info("Unstarred file id={} for user={}", fileId, userEmail);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FileResponse> getStarredFiles(String userEmail) {
        User user = getUserByEmail(userEmail);
        List<Star> stars = starRepository.findByUserId(user.getId());

        // Exclude soft-deleted files (deletedAt IS NOT NULL) from Starred view
        return stars.stream()
                .filter(star -> star.getFile() != null && star.getFile().getDeletedAt() == null)
                .map(star -> FileResponse.fromEntity(star.getFile()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UUID> getStarredFileIds(String userEmail) {
        User user = getUserByEmail(userEmail);
        List<Star> stars = starRepository.findByUserId(user.getId());

        return stars.stream()
                .filter(star -> star.getFile() != null && star.getFile().getDeletedAt() == null)
                .map(star -> star.getFile().getId())
                .toList();
    }
}

