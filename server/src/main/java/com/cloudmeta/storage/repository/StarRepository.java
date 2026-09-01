package com.cloudmeta.storage.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cloudmeta.storage.entity.Star;

@Repository
public interface StarRepository extends JpaRepository<Star, UUID> {

    Optional<Star> findByUserIdAndFileId(UUID userId, UUID fileId);

    boolean existsByUserIdAndFileId(UUID userId, UUID fileId);

    void deleteByUserIdAndFileId(UUID userId, UUID fileId);

    List<Star> findByUserId(UUID userId);
}

