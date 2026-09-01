package com.cloudmeta.storage.service;

import java.util.List;
import java.util.UUID;

import com.cloudmeta.storage.dto.linkshare.CreatePublicLinkRequest;
import com.cloudmeta.storage.dto.linkshare.PublicAccessResponse;
import com.cloudmeta.storage.dto.linkshare.PublicLinkResponse;

public interface LinkShareService {

    PublicLinkResponse createPublicLink(CreatePublicLinkRequest request, String ownerEmail);

    List<PublicLinkResponse> getPublicLinksForFile(UUID fileId, String ownerEmail);

    void revokePublicLink(UUID linkShareId, String ownerEmail);

    PublicAccessResponse accessPublicLink(String token);

    PublicAccessResponse verifyPasswordAndAccess(String token, String password);
}

