package com.cloudmeta.storage.service;

import java.util.List;
import java.util.UUID;

import com.cloudmeta.storage.dto.folder.BreadcrumbItem;
import com.cloudmeta.storage.dto.folder.CreateFolderRequest;
import com.cloudmeta.storage.dto.folder.FolderResponse;
import com.cloudmeta.storage.dto.folder.UpdateFolderRequest;

public interface FolderService {

    FolderResponse createFolder(CreateFolderRequest request, String userEmail);

    List<FolderResponse> getFolders(UUID parentId, String userEmail);

    FolderResponse getFolderById(UUID folderId, String userEmail);

    FolderResponse renameFolder(UUID folderId, UpdateFolderRequest request, String userEmail);

    void deleteFolder(UUID folderId, String userEmail);

    List<BreadcrumbItem> getBreadcrumbs(UUID folderId, String userEmail);
}

