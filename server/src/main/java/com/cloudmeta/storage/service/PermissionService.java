package com.cloudmeta.storage.service;

import java.util.UUID;

import com.cloudmeta.storage.entity.File;
import com.cloudmeta.storage.entity.User;
import com.cloudmeta.storage.security.FilePermission;

public interface PermissionService {

    boolean hasPermission(User user, File file, FilePermission permission);

    boolean hasPermission(String userEmail, UUID fileId, FilePermission permission);

    void requirePermission(User user, File file, FilePermission permission);

    void requirePermission(String userEmail, UUID fileId, FilePermission permission);
}

