
package com.shopsphere.user.service;

import com.shopsphere.user.entity.Role;
import com.shopsphere.user.entity.User;
import com.shopsphere.user.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User createVerifiedCustomer(
            String fullName,
            String email,
            String encodedPassword
    ) {
        String normalizedEmail = email.trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        User user = new User();

        user.setFullName(fullName.trim());
        user.setEmail(normalizedEmail);

        // Password was already BCrypt-encoded before OTP was sent.
        user.setPassword(encodedPassword);

        // Public registrations can only create CUSTOMER accounts.
        user.setRole(Role.CUSTOMER);
        user.setActive(true);
        user.setEmailVerified(true);

        return userRepository.save(user);
    }
}
