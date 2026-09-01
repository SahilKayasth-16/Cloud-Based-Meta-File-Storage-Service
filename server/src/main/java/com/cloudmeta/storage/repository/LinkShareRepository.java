package com.cloudmeta.storage.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cloudmeta.storage.entity.LinkShare;

@Repository
public interface LinkShareRepository extends JpaRepository<LinkShare, UUID> {

    Optional<LinkShare> findByToken(String token);

    List<LinkShare> findByFileIdAndActiveTrue(UUID fileId);

    List<LinkShare> findByFileId(UUID fileId);
}

