
package com.shopsphere.user.controller;

import com.shopsphere.user.dto.UserProfileResponse;
import com.shopsphere.user.entity.User;
import com.shopsphere.user.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found.")
                );

        UserProfileResponse response = new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getActive(),
                user.getEmailVerified(),
                user.getCreatedAt()
        );

        return ResponseEntity.ok(response);
    }
}
