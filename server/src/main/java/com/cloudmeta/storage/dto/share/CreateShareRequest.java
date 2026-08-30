package com.cloudmeta.storage.dto.share;

import java.util.UUID;

import com.cloudmeta.storage.entity.ShareRole;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateShareRequest {

    @NotNull(message = "File ID is required")
    private UUID fileId;

    @NotBlank(message = "Target user email is required")
    @Email(message = "Target user email must be valid")
    private String email;

    @NotNull(message = "Share role is required")
    private ShareRole role;
}

