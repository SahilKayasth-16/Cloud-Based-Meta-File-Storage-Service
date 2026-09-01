package com.cloudmeta.storage.dto.linkshare;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerifyPasswordRequest {

    @NotBlank(message = "Password is required")
    private String password;
}

