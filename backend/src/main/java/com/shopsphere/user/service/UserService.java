
package com.shopsphere.user.service;

import com.shopsphere.user.dto.RegisterRequest;
import com.shopsphere.user.entity.Role;
import com.shopsphere.user.entity.User;
import com.shopsphere.user.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerUser(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        User user = new User();

        user.setFullName(request.getFullName().trim());
        user.setEmail(email);

        // Never store plain-text passwords.
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        // Public registrations always receive CUSTOMER role.
        user.setRole(Role.CUSTOMER);
        user.setActive(true);

        return userRepository.save(user);
    }
}
