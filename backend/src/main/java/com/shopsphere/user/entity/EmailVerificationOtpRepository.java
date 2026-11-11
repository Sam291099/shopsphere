
package com.shopsphere.user.repository;

import com.shopsphere.user.entity.EmailVerificationOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailVerificationOtpRepository
        extends JpaRepository<EmailVerificationOtp, Long> {

    Optional<EmailVerificationOtp> findByEmail(String email);

    void deleteByEmail(String email);
}
