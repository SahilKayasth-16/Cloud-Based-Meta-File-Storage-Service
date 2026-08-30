package com.cloudmeta.storage.service;

import java.util.List;
import java.util.UUID;

import com.cloudmeta.storage.dto.share.CreateShareRequest;
import com.cloudmeta.storage.dto.share.ShareResponse;

public interface ShareService {

    ShareResponse createShare(CreateShareRequest request, String ownerEmail);

    List<ShareResponse> getSharesForFile(UUID fileId, String ownerEmail);

    void removeShare(UUID shareId, String ownerEmail);
}

