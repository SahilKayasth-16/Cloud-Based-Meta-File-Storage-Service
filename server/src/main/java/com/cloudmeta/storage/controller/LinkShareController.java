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

import com.cloudmeta.storage.dto.linkshare.CreatePublicLinkRequest;
import com.cloudmeta.storage.dto.linkshare.PublicAccessResponse;
import com.cloudmeta.storage.dto.linkshare.PublicLinkResponse;
import com.cloudmeta.storage.dto.linkshare.VerifyPasswordRequest;
import com.cloudmeta.storage.service.LinkShareService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public-links")
@RequiredArgsConstructor
public class LinkShareController {

    private final LinkShareService linkShareService;

    @PostMapping
    public ResponseEntity<PublicLinkResponse> createPublicLink(
            @Valid @RequestBody CreatePublicLinkRequest request,
            Authentication authentication
    ) {
        PublicLinkResponse response = linkShareService.createPublicLink(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/file/{fileId}")
    public ResponseEntity<List<PublicLinkResponse>> getPublicLinksForFile(
            @PathVariable UUID fileId,
            Authentication authentication
    ) {
        List<PublicLinkResponse> links = linkShareService.getPublicLinksForFile(fileId, authentication.getName());
        return ResponseEntity.ok(links);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> revokePublicLink(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        linkShareService.revokePublicLink(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{token}")
    public ResponseEntity<PublicAccessResponse> accessPublicLink(
            @PathVariable String token
    ) {
        PublicAccessResponse response = linkShareService.accessPublicLink(token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{token}/verify")
    public ResponseEntity<PublicAccessResponse> verifyPasswordAndAccess(
            @PathVariable String token,
            @Valid @RequestBody VerifyPasswordRequest request
    ) {
        PublicAccessResponse response = linkShareService.verifyPasswordAndAccess(token, request.getPassword());
        return ResponseEntity.ok(response);
    }
}

