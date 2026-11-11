
package com.shopsphere.user.service;

import com.shopsphere.user.repository.EmailVerificationOtpRepository;
import com.shopsphere.user.repository.PasswordResetOtpRepository;
import com.shopsphere.user.repository.PasswordResetTokenRepository;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class OtpCleanupScheduler {

    private final EmailVerificationOtpRepository emailVerificationOtpRepository;
    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    public OtpCleanupScheduler(
            EmailVerificationOtpRepository emailVerificationOtpRepository,
            PasswordResetOtpRepository passwordResetOtpRepository,
            PasswordResetTokenRepository passwordResetTokenRepository
    ) {
        this.emailVerificationOtpRepository = emailVerificationOtpRepository;
        this.passwordResetOtpRepository = passwordResetOtpRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
    }

    @Scheduled(fixedDelay = 3600000)
    @Transactional
    public void cleanExpiredRecords() {

        LocalDateTime now = LocalDateTime.now();

        emailVerificationOtpRepository.deleteByExpiresAtBefore(now);
        passwordResetOtpRepository.deleteByExpiresAtBefore(now);
        passwordResetTokenRepository.deleteByExpiresAtBefore(now);
    }
}
