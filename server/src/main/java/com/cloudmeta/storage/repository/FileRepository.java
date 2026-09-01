package com.cloudmeta.storage.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cloudmeta.storage.entity.File;

@Repository
public interface FileRepository extends JpaRepository<File, UUID> {

    List<File> findByOwnerIdAndFolderIsNullAndDeletedAtIsNullOrderByFilenameAsc(UUID ownerId);

    List<File> findByOwnerIdAndFolderIdAndDeletedAtIsNullOrderByFilenameAsc(UUID ownerId, UUID folderId);

    List<File> findByOwnerIdAndDeletedAtIsNotNullOrderByDeletedAtDesc(UUID ownerId);

    Optional<File> findByIdAndOwnerIdAndDeletedAtIsNull(UUID id, UUID ownerId);

    Optional<File> findByIdAndOwnerId(UUID id, UUID ownerId);

    boolean existsByOwnerIdAndFolderIdAndFilename(UUID ownerId, UUID folderId, String filename);

    boolean existsByOwnerIdAndFolderIsNullAndFilename(UUID ownerId, String filename);

    List<File> findByFolderId(UUID folderId);
}
