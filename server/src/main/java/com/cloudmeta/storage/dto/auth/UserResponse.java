package com.cloudmeta.storage.dto.auth;

import java.util.UUID;

import com.cloudmeta.storage.entity.UserRole;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private UUID id;
    private String name;
    private String email;
    private UserRole role;
}
