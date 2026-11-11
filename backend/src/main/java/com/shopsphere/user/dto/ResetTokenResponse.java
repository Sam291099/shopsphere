
package com.shopsphere.user.dto;

public record ResetTokenResponse(
        String message,
        String resetToken
) {
}
