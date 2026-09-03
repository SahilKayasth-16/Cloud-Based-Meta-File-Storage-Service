package com.cloudmeta.storage.repository.specification;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;

import com.cloudmeta.storage.dto.file.FileSearchRequest;
import com.cloudmeta.storage.entity.File;
import com.cloudmeta.storage.entity.Share;
import com.cloudmeta.storage.entity.Star;
import com.cloudmeta.storage.entity.User;

import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

public class FileSpecification {

    public static Specification<File> buildSpecification(FileSearchRequest request, User user) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Mandatory Soft-Delete Exclusion: Only active files (deletedAt IS NULL)
            predicates.add(cb.isNull(root.get("deletedAt")));

            // 2. Mandatory Access Control: User must be Owner OR have a Share record
            Predicate isOwner = cb.equal(root.get("owner").get("id"), user.getId());

            Subquery<UUID> shareSubquery = query.subquery(UUID.class);
            Root<Share> shareRoot = shareSubquery.from(Share.class);
            shareSubquery.select(shareRoot.get("file").get("id"))
                    .where(cb.equal(shareRoot.get("user").get("id"), user.getId()));
            Predicate isShared = root.get("id").in(shareSubquery);

            predicates.add(cb.or(isOwner, isShared));

            // 3. Free-text search query (q) or name filter - case-insensitive partial match
            String searchTerm = null;
            if (request.getQ() != null && !request.getQ().trim().isEmpty()) {
                searchTerm = request.getQ().trim();
            } else if (request.getName() != null && !request.getName().trim().isEmpty()) {
                searchTerm = request.getName().trim();
            }

            if (searchTerm != null) {
                String pattern = "%" + searchTerm.toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("filename")), pattern));
            }

            // 4. MIME Type / Content-Type filter
            if (request.getMimeType() != null && !request.getMimeType().trim().isEmpty()) {
                String mimePattern = "%" + request.getMimeType().trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("contentType")), mimePattern));
            }

            // 5. Direct Folder filter
            if (request.getFolderId() != null) {
                predicates.add(cb.equal(root.get("folder").get("id"), request.getFolderId()));
            }

            // 6. Created Date Range filter
            if (request.getCreatedFrom() != null) {
                LocalDateTime fromDateTime = request.getCreatedFrom().atStartOfDay();
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromDateTime));
            }
            if (request.getCreatedTo() != null) {
                LocalDateTime toDateTime = request.getCreatedTo().atTime(LocalTime.MAX);
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), toDateTime));
            }

            // 7. File Size Range filter
            if (request.getMinSize() != null && request.getMinSize() >= 0) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("size"), request.getMinSize()));
            }
            if (request.getMaxSize() != null && request.getMaxSize() >= 0) {
                predicates.add(cb.lessThanOrEqualTo(root.get("size"), request.getMaxSize()));
            }

            // 8. User-Specific Starred filter
            if (Boolean.TRUE.equals(request.getStarred())) {
                Subquery<UUID> starSubquery = query.subquery(UUID.class);
                Root<Star> starRoot = starSubquery.from(Star.class);
                starSubquery.select(starRoot.get("file").get("id"))
                        .where(cb.equal(starRoot.get("user").get("id"), user.getId()));
                predicates.add(root.get("id").in(starSubquery));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

