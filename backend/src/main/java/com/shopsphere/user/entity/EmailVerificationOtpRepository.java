
package com.shopsphere.user.repository;

import com.shopsphere.user.entity.EmailVerificationOtp;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface EmailVerificationOtpRepository
        extends JpaRepository<EmailVerificationOtp, Long> {

    Optional<EmailVerificationOtp> findByEmail(String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM EmailVerificationOtp e WHERE e.email = :email")
    Optional<EmailVerificationOtp> findByEmailForUpdate(
            @Param("email") String email
    );

    void deleteByEmail(String email);

    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}
