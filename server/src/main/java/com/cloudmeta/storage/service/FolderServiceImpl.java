package com.cloudmeta.storage.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cloudmeta.storage.dto.folder.BreadcrumbItem;
import com.cloudmeta.storage.dto.folder.CreateFolderRequest;
import com.cloudmeta.storage.dto.folder.FolderResponse;
import com.cloudmeta.storage.dto.folder.UpdateFolderRequest;
import com.cloudmeta.storage.entity.Folder;
import com.cloudmeta.storage.entity.User;
import com.cloudmeta.storage.exception.DuplicateFolderNameException;
import com.cloudmeta.storage.exception.FolderNotFoundException;
import com.cloudmeta.storage.repository.FolderRepository;
import com.cloudmeta.storage.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FolderServiceImpl implements FolderService {

    private final FolderRepository folderRepository;
    private final UserRepository userRepository;

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    @Override
    @Transactional
    public FolderResponse createFolder(CreateFolderRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);
        String name = request.getName().trim();
        Folder parent = null;

        if (request.getParentId() != null) {
            parent = folderRepository.findByIdAndOwnerId(request.getParentId(), user.getId())
                    .orElseThrow(() -> new FolderNotFoundException("Parent folder not found"));

            if (folderRepository.existsByOwnerIdAndParentIdAndName(user.getId(), parent.getId(), name)) {
                throw new DuplicateFolderNameException("A folder named '" + name + "' already exists in this folder");
            }
        } else {
            if (folderRepository.existsByOwnerIdAndParentIsNullAndName(user.getId(), name)) {
                throw new DuplicateFolderNameException("A folder named '" + name + "' already exists in the root directory");
            }
        }

        Folder folder = Folder.builder()
                .name(name)
                .parent(parent)
                .owner(user)
                .build();

        Folder savedFolder = folderRepository.save(folder);
        return FolderResponse.fromEntity(savedFolder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FolderResponse> getFolders(UUID parentId, String userEmail) {
        User user = getUserByEmail(userEmail);

        if (parentId != null) {
            folderRepository.findByIdAndOwnerId(parentId, user.getId())
                    .orElseThrow(() -> new FolderNotFoundException("Parent folder not found"));

            return folderRepository.findByOwnerIdAndParentIdOrderByNameAsc(user.getId(), parentId)
                    .stream()
                    .map(FolderResponse::fromEntity)
                    .toList();
        }

        return folderRepository.findByOwnerIdAndParentIsNullOrderByNameAsc(user.getId())
                .stream()
                .map(FolderResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FolderResponse getFolderById(UUID folderId, String userEmail) {
        User user = getUserByEmail(userEmail);

        Folder folder = folderRepository.findByIdAndOwnerId(folderId, user.getId())
                .orElseThrow(() -> new FolderNotFoundException("Folder not found"));

        return FolderResponse.fromEntity(folder);
    }

    @Override
    @Transactional
    public FolderResponse renameFolder(UUID folderId, UpdateFolderRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);
        String newName = request.getName().trim();

        Folder folder = folderRepository.findByIdAndOwnerId(folderId, user.getId())
                .orElseThrow(() -> new FolderNotFoundException("Folder not found"));

        if (folder.getName().equals(newName)) {
            return FolderResponse.fromEntity(folder);
        }

        if (folder.getParent() != null) {
            if (folderRepository.existsByOwnerIdAndParentIdAndName(user.getId(), folder.getParent().getId(), newName)) {
                throw new DuplicateFolderNameException("A folder named '" + newName + "' already exists in this folder");
            }
        } else {
            if (folderRepository.existsByOwnerIdAndParentIsNullAndName(user.getId(), newName)) {
                throw new DuplicateFolderNameException("A folder named '" + newName + "' already exists in the root directory");
            }
        }

        folder.setName(newName);
        Folder updatedFolder = folderRepository.save(folder);
        return FolderResponse.fromEntity(updatedFolder);
    }

    @Override
    @Transactional
    public void deleteFolder(UUID folderId, String userEmail) {
        User user = getUserByEmail(userEmail);

        Folder folder = folderRepository.findByIdAndOwnerId(folderId, user.getId())
                .orElseThrow(() -> new FolderNotFoundException("Folder not found"));

        folderRepository.delete(folder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BreadcrumbItem> getBreadcrumbs(UUID folderId, String userEmail) {
        User user = getUserByEmail(userEmail);

        List<BreadcrumbItem> items = new ArrayList<>();
        Folder current = folderRepository.findByIdAndOwnerId(folderId, user.getId())
                .orElseThrow(() -> new FolderNotFoundException("Folder not found"));

        while (current != null) {
            items.add(new BreadcrumbItem(current.getId(), current.getName()));
            current = current.getParent();
        }

        Collections.reverse(items);
        return items;
    }
}

