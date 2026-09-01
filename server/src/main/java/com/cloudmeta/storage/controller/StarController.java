package com.cloudmeta.storage.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cloudmeta.storage.dto.file.FileResponse;
import com.cloudmeta.storage.service.StarService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class StarController {

    private final StarService starService;

    @GetMapping("/api/starred")
    public ResponseEntity<List<FileResponse>> getStarredFiles(Authentication authentication) {
        List<FileResponse> files = starService.getStarredFiles(authentication.getName());
        return ResponseEntity.ok(files);
    }

    @GetMapping("/api/starred/ids")
    public ResponseEntity<List<UUID>> getStarredFileIds(Authentication authentication) {
        List<UUID> ids = starService.getStarredFileIds(authentication.getName());
        return ResponseEntity.ok(ids);
    }

    @PostMapping("/api/files/{id}/star")
    public ResponseEntity<Void> starFile(@PathVariable UUID id, Authentication authentication) {
        starService.starFile(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/api/files/{id}/star")
    public ResponseEntity<Void> unstarFile(@PathVariable UUID id, Authentication authentication) {
        starService.unstarFile(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}

