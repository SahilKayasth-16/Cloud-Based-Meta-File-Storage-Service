package com.cloudmeta.storage.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cloudmeta.storage.dto.file.FilePageResponse;
import com.cloudmeta.storage.dto.file.FileResponse;
import com.cloudmeta.storage.dto.file.FileSearchRequest;
import com.cloudmeta.storage.entity.File;
import com.cloudmeta.storage.entity.User;
import com.cloudmeta.storage.repository.FileRepository;
import com.cloudmeta.storage.repository.UserRepository;
import com.cloudmeta.storage.repository.specification.FileSpecification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileSearchServiceImpl implements FileSearchService {

    private final FileRepository fileRepository;
    private final UserRepository userRepository;

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    @Override
    @Transactional(readOnly = true)
    public FilePageResponse searchFiles(FileSearchRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);

        // 1. Pagination & Sorting Validation
        int page = (request.getPage() != null && request.getPage() >= 0) ? request.getPage() : 0;
        int size = (request.getSize() != null && request.getSize() > 0) ? Math.min(request.getSize(), 100) : 20;

        String sortBy = "createdAt";
        if (request.getSortBy() != null && List.of("filename", "size", "createdAt").contains(request.getSortBy())) {
            sortBy = request.getSortBy();
        }

        Sort.Direction direction = "ASC".equalsIgnoreCase(request.getSortDirection()) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        // 2. Build PostgreSQL Specification
        Specification<File> spec = FileSpecification.buildSpecification(request, user);

        // 3. Execute Server-Side Filtered Query
        Page<File> filePage = fileRepository.findAll(spec, pageable);
        log.info("Search executed for user={}, query='{}', matches={}", userEmail, request.getQ(), filePage.getTotalElements());

        Page<FileResponse> responsePage = filePage.map(FileResponse::fromEntity);
        return FilePageResponse.fromPage(responsePage);
    }
}

