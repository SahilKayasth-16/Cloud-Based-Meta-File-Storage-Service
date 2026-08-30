package com.cloudmeta.storage.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cloudmeta.storage.entity.Share;

@Repository
public interface ShareRepository extends JpaRepository<Share, UUID> {

    Optional<Share> findByFileIdAndUserId(UUID fileId, UUID userId);

    boolean existsByFileIdAndUserId(UUID fileId, UUID userId);

    List<Share> findByFileId(UUID fileId);

    List<Share> findByUserId(UUID userId);
}

