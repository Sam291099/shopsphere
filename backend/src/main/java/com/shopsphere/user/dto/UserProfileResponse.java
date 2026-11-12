
package com.shopsphere.user.dto;

import com.shopsphere.user.entity.Role;
import java.time.LocalDateTime;

public record UserProfileResponse(
        Long id,
        String fullName,
        String email,
        Role role,
        Boolean active,
        Boolean emailVerified,
        LocalDateTime createdAt
) {
}
