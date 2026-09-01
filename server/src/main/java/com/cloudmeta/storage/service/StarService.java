package com.cloudmeta.storage.service;

import java.util.List;
import java.util.UUID;

import com.cloudmeta.storage.dto.file.FileResponse;

public interface StarService {

    void starFile(UUID fileId, String userEmail);

    void unstarFile(UUID fileId, String userEmail);

    List<FileResponse> getStarredFiles(String userEmail);

    List<UUID> getStarredFileIds(String userEmail);
}

