package com.cloudmeta.storage.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cloudmeta.storage.dto.file.FileResponse;
import com.cloudmeta.storage.service.TrashService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class TrashController {

    private final TrashService trashService;

    @GetMapping("/api/trash")
    public ResponseEntity<List<FileResponse>> getTrashFiles(Authentication authentication) {
        List<FileResponse> files = trashService.getTrashFiles(authentication.getName());
        return ResponseEntity.ok(files);
    }

    @PostMapping("/api/files/{id}/restore")
    public ResponseEntity<FileResponse> restoreFile(@PathVariable UUID id, Authentication authentication) {
        FileResponse file = trashService.restoreFile(id, authentication.getName());
        return ResponseEntity.ok(file);
    }
}

