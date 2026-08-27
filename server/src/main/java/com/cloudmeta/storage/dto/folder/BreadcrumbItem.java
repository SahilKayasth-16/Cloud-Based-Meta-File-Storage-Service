package com.cloudmeta.storage.dto.folder;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BreadcrumbItem {

    private UUID id;
    private String name;
}

