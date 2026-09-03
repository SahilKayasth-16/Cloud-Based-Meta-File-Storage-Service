package com.cloudmeta.storage.service;

import com.cloudmeta.storage.dto.file.FilePageResponse;
import com.cloudmeta.storage.dto.file.FileSearchRequest;

public interface FileSearchService {

    FilePageResponse searchFiles(FileSearchRequest request, String userEmail);
}

