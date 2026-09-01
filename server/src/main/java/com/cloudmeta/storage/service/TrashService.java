package com.cloudmeta.storage.service;

import java.util.List;
import java.util.UUID;

import com.cloudmeta.storage.dto.file.FileResponse;

public interface TrashService {

    List<FileResponse> getTrashFiles(String userEmail);

    FileResponse restoreFile(UUID fileId, String userEmail);
}

