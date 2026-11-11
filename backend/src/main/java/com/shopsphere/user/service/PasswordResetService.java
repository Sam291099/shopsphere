
package com.shopsphere.user.service;

import com.shopsphere.user.entity.PasswordResetOtp;
import com.shopsphere.user.entity.PasswordResetToken;
import com.shopsphere.user.entity.User;

import com.shopsphere.user.repository.PasswordResetOtpRepository;
import com.shopsphere.user.repository.PasswordResetTokenRepository;
import com.shopsphere.user.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;

@Service
public class PasswordResetService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final PasswordResetOtpRepository resetOtpRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Value("${app.otp.expiration-minutes:5}")
    private long expirationMinutes;

    @Value("${app.otp.resend-cooldown-seconds:60}")
    private long resendCooldownSeconds;

    @Value("${app.otp.max-attempts:5}")
    private int maxAttempts;

    @Value("${app.password-reset.token-expiration-minutes:10}")
    private long resetTokenExpirationMinutes;

    public PasswordResetService(
            PasswordResetOtpRepository resetOtpRepository,
            PasswordResetTokenRepository resetTokenRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender
    ) {
        this.resetOtpRepository = resetOtpRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    @Transactional
    public void sendResetOtp(String email) {

        String normalizedEmail = normalizeEmail(email);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElse(null);

        if (user == null ||
                !Boolean.TRUE.equals(user.getActive()) ||
                !Boolean.TRUE.equals(user.getEmailVerified())) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        PasswordResetOtp pending = resetOtpRepository
                .findByEmailForUpdate(normalizedEmail)
                .orElseGet(PasswordResetOtp::new);

        if (pending.getId() != null &&
                pending.getLastSentAt().plusSeconds(
                        resendCooldownSeconds
                ).isAfter(now)) {
            throw new IllegalArgumentException(
                    "Please wait before requesting another OTP."
            );
        }

        String otp = generateOtp();

        pending.setEmail(normalizedEmail);
        pending.setOtpHash(passwordEncoder.encode(otp));
        pending.setExpiresAt(now.plusMinutes(expirationMinutes));
        pending.setLastSentAt(now);
        pending.setAttempts(0);

        resetOtpRepository.save(pending);

        // A new OTP invalidates any previously issued reset token.
        resetTokenRepository.deleteByEmail(normalizedEmail);

        sendOtpEmail(normalizedEmail, user.getFullName(), otp);
    }

    @Transactional
    public String verifyResetOtp(String email, String otp) {

        String normalizedEmail = normalizeEmail(email);

        PasswordResetOtp pending = resetOtpRepository
                .findByEmailForUpdate(normalizedEmail)
                .orElse(null);

        if (pending == null) {
            return null;
        }

        LocalDateTime now = LocalDateTime.now();

        if (!pending.getExpiresAt().isAfter(now) ||
                pending.getAttempts() >= maxAttempts) {
            resetOtpRepository.delete(pending);
            return null;
        }

        if (!passwordEncoder.matches(otp, pending.getOtpHash())) {
            pending.setAttempts(pending.getAttempts() + 1);
            resetOtpRepository.saveAndFlush(pending);
            return null;
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElse(null);

        if (user == null ||
                !Boolean.TRUE.equals(user.getActive()) ||
                !Boolean.TRUE.equals(user.getEmailVerified())) {
            resetOtpRepository.delete(pending);
            return null;
        }

        // Generate a cryptographically secure random token.
        byte[] randomBytes = new byte[32];
        RANDOM.nextBytes(randomBytes);

        String rawToken = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        PasswordResetToken resetToken = new PasswordResetToken();

        resetToken.setEmail(normalizedEmail);
        resetToken.setTokenHash(sha256(rawToken));
        resetToken.setCreatedAt(now);
        resetToken.setExpiresAt(
                now.plusMinutes(resetTokenExpirationMinutes)
        );

        // Remove older tokens before issuing a new one.
        resetTokenRepository.deleteByEmail(normalizedEmail);
        resetTokenRepository.save(resetToken);

        // Consume the OTP. It cannot be used again.
        resetOtpRepository.delete(pending);

        return rawToken;
    }

    @Transactional
    public boolean resetPassword(
            String rawToken,
            String newPassword
    ) {

        if (rawToken == null || rawToken.isBlank()) {
            return false;
        }

        String tokenHash = sha256(rawToken);

        PasswordResetToken pendingToken = resetTokenRepository
                .findByTokenHashForUpdate(tokenHash)
                .orElse(null);

        if (pendingToken == null) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();

        if (!pendingToken.getExpiresAt().isAfter(now)) {
            resetTokenRepository.delete(pendingToken);
            return false;
        }

        User user = userRepository.findByEmail(
                pendingToken.getEmail()
        ).orElse(null);

        if (user == null ||
                !Boolean.TRUE.equals(user.getActive()) ||
                !Boolean.TRUE.equals(user.getEmailVerified())) {
            resetTokenRepository.delete(pendingToken);
            return false;
        }

        user.setPassword(passwordEncoder.encode(newPassword));

        // Invalidate every previously issued JWT.
        user.setTokenVersion(
                user.getTokenVersion() == null
                        ? 1L
                        : user.getTokenVersion() + 1L
        );

        userRepository.save(user);

        // Consume the token so it cannot be used twice.
        resetTokenRepository.delete(pendingToken);

        return true;
    }

    private String generateOtp() {
        return String.format(
                Locale.ROOT,
                "%06d",
                RANDOM.nextInt(1_000_000)
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String sha256(String value) {
        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    value.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);

        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException(
                    "SHA-256 is unavailable.", ex
            );
        }
    }

    private void sendOtpEmail(
            String email,
            String fullName,
            String otp
    ) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(senderEmail);
        message.setTo(email);
        message.setSubject("ShopSphere - Password Reset OTP");

        message.setText(
                "Hello " + fullName + ",\n\n" +
                "We received a request to reset your ShopSphere password.\n\n" +
                "Your password reset OTP is: " + otp + "\n\n" +
                "This OTP expires in " + expirationMinutes + " minutes.\n" +
                "You can request another OTP after " +
                resendCooldownSeconds + " seconds.\n\n" +
                "If you did not request a password reset, please ignore this email.\n\n" +
                "Regards,\nShopSphere Team"
        );

        mailSender.send(message);
    }
}
