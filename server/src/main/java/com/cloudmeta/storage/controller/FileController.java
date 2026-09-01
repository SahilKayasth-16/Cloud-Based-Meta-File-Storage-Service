package com.cloudmeta.storage.controller;

import java.io.InputStream;
import java.util.List;
import java.util.UUID;

import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.cloudmeta.storage.dto.file.DownloadUrlResponse;
import com.cloudmeta.storage.dto.file.FileResponse;
import com.cloudmeta.storage.service.FileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<FileResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folderId", required = false) UUID folderId,
            Authentication authentication
    ) {
        FileResponse response = fileService.uploadFile(file, folderId, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<FileResponse>> getFiles(
            @RequestParam(value = "folderId", required = false) UUID folderId,
            Authentication authentication
    ) {
        List<FileResponse> files = fileService.getFiles(folderId, authentication.getName());
        return ResponseEntity.ok(files);
    }

    @GetMapping("/shared-with-me")
    public ResponseEntity<List<FileResponse>> getSharedFiles(
            Authentication authentication
    ) {
        List<FileResponse> files = fileService.getSharedFiles(authentication.getName());
        return ResponseEntity.ok(files);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FileResponse> getFileById(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        FileResponse response = fileService.getFileById(id, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/download-url")
    public ResponseEntity<DownloadUrlResponse> getDownloadUrl(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        DownloadUrlResponse response = fileService.getDownloadUrl(id, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/download-raw")
    public ResponseEntity<Resource> downloadRaw(
            @RequestParam("key") String key,
            @RequestParam(value = "shareToken", required = false) String shareToken,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        InputStream inputStream = fileService.getFileInputStreamByKey(key, shareToken, userEmail);
        InputStreamResource resource = new InputStreamResource(inputStream);

        String filename = key.contains("_") ? key.substring(key.indexOf("_") + 1) : "downloaded_file";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDeleteFile(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        fileService.softDeleteFile(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
