package com.cloudmeta.storage.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cloudmeta.storage.dto.share.CreateShareRequest;
import com.cloudmeta.storage.dto.share.ShareResponse;
import com.cloudmeta.storage.service.ShareService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/shares")
@RequiredArgsConstructor
public class ShareController {

    private final ShareService shareService;

    @PostMapping
    public ResponseEntity<ShareResponse> createShare(
            @Valid @RequestBody CreateShareRequest request,
            Authentication authentication
    ) {
        ShareResponse response = shareService.createShare(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/file/{fileId}")
    public ResponseEntity<List<ShareResponse>> getSharesForFile(
            @PathVariable UUID fileId,
            Authentication authentication
    ) {
        List<ShareResponse> shares = shareService.getSharesForFile(fileId, authentication.getName());
        return ResponseEntity.ok(shares);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeShare(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        shareService.removeShare(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}

