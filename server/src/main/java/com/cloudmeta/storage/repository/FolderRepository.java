package com.cloudmeta.storage.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cloudmeta.storage.entity.Folder;

@Repository
public interface FolderRepository extends JpaRepository<Folder, UUID> {

    List<Folder> findByOwnerIdAndParentIsNullOrderByNameAsc(UUID ownerId);

    List<Folder> findByOwnerIdAndParentIdOrderByNameAsc(UUID ownerId, UUID parentId);

    Optional<Folder> findByIdAndOwnerId(UUID id, UUID ownerId);

    boolean existsByOwnerIdAndParentIdAndName(UUID ownerId, UUID parentId, String name);

    boolean existsByOwnerIdAndParentIsNullAndName(UUID ownerId, String name);
}

