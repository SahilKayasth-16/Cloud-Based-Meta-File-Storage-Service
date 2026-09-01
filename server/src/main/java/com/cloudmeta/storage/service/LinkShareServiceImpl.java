package com.cloudmeta.storage.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cloudmeta.storage.dto.linkshare.CreatePublicLinkRequest;
import com.cloudmeta.storage.dto.linkshare.PublicAccessResponse;
import com.cloudmeta.storage.dto.linkshare.PublicLinkResponse;
import com.cloudmeta.storage.entity.File;
import com.cloudmeta.storage.entity.LinkShare;
import com.cloudmeta.storage.entity.User;
import com.cloudmeta.storage.exception.FileNotFoundException;
import com.cloudmeta.storage.exception.LinkShareExpiredException;
import com.cloudmeta.storage.repository.FileRepository;
import com.cloudmeta.storage.repository.LinkShareRepository;
import com.cloudmeta.storage.repository.UserRepository;
import com.cloudmeta.storage.security.FilePermission;
import com.cloudmeta.storage.service.storage.StorageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class LinkShareServiceImpl implements LinkShareService {

    private final LinkShareRepository linkShareRepository;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final PermissionService permissionService;
    private final StorageService storageService;
    private final PasswordEncoder passwordEncoder;

    private final SecureRandom secureRandom = new SecureRandom();

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

    private String generateSecureToken() {
        byte[] randomBytes = new byte[24];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private void validateLinkAvailability(LinkShare linkShare) {
        if (!linkShare.isActive() || (linkShare.getFile() != null && linkShare.getFile().getDeletedAt() != null)) {
            throw new LinkShareExpiredException("This share link is no longer available");
        }
        if (linkShare.getExpiresAt() != null && linkShare.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new LinkShareExpiredException("This share link has expired");
        }
    }

    @Override
    @Transactional
    public PublicLinkResponse createPublicLink(CreatePublicLinkRequest request, String ownerEmail) {
        User user = getUserByEmail(ownerEmail);
        File file = getActiveFile(request.getFileId());

        // 1. Authorize: Only file owner can create public share links
        permissionService.requirePermission(user, file, FilePermission.SHARE);

        // 2. Generate secure unpredictable random token
        String token;
        do {
            token = generateSecureToken();
        } while (linkShareRepository.findByToken(token).isPresent());

        // 3. Optional password hashing using BCrypt
        String passwordHash = null;
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            passwordHash = passwordEncoder.encode(request.getPassword());
        }

        LinkShare linkShare = LinkShare.builder()
                .token(token)
                .file(file)
                .createdBy(user)
                .expiresAt(request.getExpiresAt())
                .passwordHash(passwordHash)
                .active(true)
                .build();

        LinkShare savedLink = linkShareRepository.save(linkShare);
        log.info("Created public link share id={}, fileId={}, token={}", savedLink.getId(), file.getId(), token);

        return PublicLinkResponse.fromEntity(savedLink, "http://localhost:5173");
    }

    @Override
    @Transactional(readOnly = true)
    public List<PublicLinkResponse> getPublicLinksForFile(UUID fileId, String ownerEmail) {
        User user = getUserByEmail(ownerEmail);
        File file = getActiveFile(fileId);

        permissionService.requirePermission(user, file, FilePermission.SHARE);

        return linkShareRepository.findByFileId(file.getId())
                .stream()
                .map(link -> PublicLinkResponse.fromEntity(link, "http://localhost:5173"))
                .toList();
    }

    @Override
    @Transactional
    public void revokePublicLink(UUID linkShareId, String ownerEmail) {
        User user = getUserByEmail(ownerEmail);
        LinkShare linkShare = linkShareRepository.findById(linkShareId)
                .orElseThrow(() -> new FileNotFoundException("Public link not found"));

        permissionService.requirePermission(user, linkShare.getFile(), FilePermission.SHARE);

        // Revoke link by setting active = false
        linkShare.setActive(false);
        linkShareRepository.save(linkShare);
        log.info("Revoked public link share id={}, token={}", linkShare.getId(), linkShare.getToken());
    }

    @Override
    @Transactional(readOnly = true)
    public PublicAccessResponse accessPublicLink(String token) {
        LinkShare linkShare = linkShareRepository.findByToken(token)
                .orElseThrow(() -> new FileNotFoundException("This share link is no longer available"));

        // Validate active status and expiration
        validateLinkAvailability(linkShare);

        File file = linkShare.getFile();
        boolean hasPassword = linkShare.getPasswordHash() != null && !linkShare.getPasswordHash().isBlank();

        if (hasPassword) {
            return PublicAccessResponse.builder()
                    .filename(file.getFilename())
                    .size(file.getSize())
                    .contentType(file.getContentType())
                    .expiresAt(linkShare.getExpiresAt())
                    .passwordRequired(true)
                    .downloadUrl(null)
                    .build();
        }

        // Generate temporary signed GET URL (expires in 300s)
        String downloadUrl = storageService.generateSignedDownloadUrl(file.getStorageKey(), 300);
        if (downloadUrl.contains("download-raw") && !downloadUrl.contains("shareToken=")) {
            downloadUrl += (downloadUrl.contains("?") ? "&" : "?") + "shareToken=" + token;
        }

        return PublicAccessResponse.builder()
                .filename(file.getFilename())
                .size(file.getSize())
                .contentType(file.getContentType())
                .expiresAt(linkShare.getExpiresAt())
                .passwordRequired(false)
                .downloadUrl(downloadUrl)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PublicAccessResponse verifyPasswordAndAccess(String token, String password) {
        LinkShare linkShare = linkShareRepository.findByToken(token)
                .orElseThrow(() -> new FileNotFoundException("This share link is no longer available"));

        // Validate active status and expiration
        validateLinkAvailability(linkShare);

        if (linkShare.getPasswordHash() == null || linkShare.getPasswordHash().isBlank()) {
            return accessPublicLink(token);
        }

        // BCrypt password verification
        if (!passwordEncoder.matches(password, linkShare.getPasswordHash())) {
            throw new BadCredentialsException("Incorrect password for this shared link");
        }

        File file = linkShare.getFile();
        String downloadUrl = storageService.generateSignedDownloadUrl(file.getStorageKey(), 300);
        if (downloadUrl.contains("download-raw") && !downloadUrl.contains("shareToken=")) {
            downloadUrl += (downloadUrl.contains("?") ? "&" : "?") + "shareToken=" + token;
        }

        return PublicAccessResponse.builder()
                .filename(file.getFilename())
                .size(file.getSize())
                .contentType(file.getContentType())
                .expiresAt(linkShare.getExpiresAt())
                .passwordRequired(false)
                .downloadUrl(downloadUrl)
                .build();
    }
}

