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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cloudmeta.storage.dto.file.FileResponse;
import com.cloudmeta.storage.dto.folder.BreadcrumbItem;
import com.cloudmeta.storage.dto.folder.CreateFolderRequest;
import com.cloudmeta.storage.dto.folder.FolderResponse;
import com.cloudmeta.storage.dto.folder.UpdateFolderRequest;
import com.cloudmeta.storage.service.FileService;
import com.cloudmeta.storage.service.FolderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/folders")
@RequiredArgsConstructor
public class FolderController {

    private final FolderService folderService;
    private final FileService fileService;

    @PostMapping
    public ResponseEntity<FolderResponse> createFolder(
            @Valid @RequestBody CreateFolderRequest request,
            Authentication authentication
    ) {
        FolderResponse response = folderService.createFolder(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<FolderResponse>> getFolders(
            @RequestParam(required = false) UUID parentId,
            Authentication authentication
    ) {
        List<FolderResponse> folders = folderService.getFolders(parentId, authentication.getName());
        return ResponseEntity.ok(folders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FolderResponse> getFolderById(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        FolderResponse response = folderService.getFolderById(id, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{folderId}/files")
    public ResponseEntity<List<FileResponse>> getFolderFiles(
            @PathVariable UUID folderId,
            Authentication authentication
    ) {
        List<FileResponse> files = fileService.getFiles(folderId, authentication.getName());
        return ResponseEntity.ok(files);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FolderResponse> renameFolder(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateFolderRequest request,
            Authentication authentication
    ) {
        FolderResponse response = folderService.renameFolder(id, request, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFolder(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        folderService.deleteFolder(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/breadcrumbs")
    public ResponseEntity<List<BreadcrumbItem>> getBreadcrumbs(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        List<BreadcrumbItem> breadcrumbs = folderService.getBreadcrumbs(id, authentication.getName());
        return ResponseEntity.ok(breadcrumbs);
    }
}
