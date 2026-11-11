
package com.shopsphere.user.service;

import com.shopsphere.user.entity.PasswordResetOtp;
import com.shopsphere.user.entity.User;
import com.shopsphere.user.repository.PasswordResetOtpRepository;
import com.shopsphere.user.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Locale;

@Service
public class PasswordResetService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final PasswordResetOtpRepository resetOtpRepository;
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

    public PasswordResetService(
            PasswordResetOtpRepository resetOtpRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender
    ) {
        this.resetOtpRepository = resetOtpRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    @Transactional
    public void sendResetOtp(String email) {

        String normalizedEmail = normalizeEmail(email);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElse(null);

        // Use the same outward response whether the account exists or not.
        // This helps prevent email-address enumeration.
        if (user == null ||
                !Boolean.TRUE.equals(user.getActive()) ||
                !Boolean.TRUE.equals(user.getEmailVerified())) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        PasswordResetOtp pending = resetOtpRepository
                .findByEmail(normalizedEmail)
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

        sendOtpEmail(normalizedEmail, user.getFullName(), otp);
    }

    @Transactional
    public boolean verifyResetOtp(String email, String otp) {

        String normalizedEmail = normalizeEmail(email);

        PasswordResetOtp pending = resetOtpRepository
                .findByEmail(normalizedEmail)
                .orElse(null);

        if (pending == null) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();

        if (!pending.getExpiresAt().isAfter(now)) {
            resetOtpRepository.delete(pending);
            return false;
        }

        if (pending.getAttempts() >= maxAttempts) {
            resetOtpRepository.delete(pending);
            return false;
        }

        if (!passwordEncoder.matches(otp, pending.getOtpHash())) {
            pending.setAttempts(pending.getAttempts() + 1);
            resetOtpRepository.saveAndFlush(pending);
            return false;
        }

        return true;
    }

    @Transactional
    public boolean resetPassword(
            String email,
            String otp,
            String newPassword
    ) {

        String normalizedEmail = normalizeEmail(email);

        PasswordResetOtp pending = resetOtpRepository
                .findByEmail(normalizedEmail)
                .orElse(null);

        if (pending == null) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();

        if (!pending.getExpiresAt().isAfter(now) ||
                pending.getAttempts() >= maxAttempts) {
            resetOtpRepository.delete(pending);
            return false;
        }

        if (!passwordEncoder.matches(otp, pending.getOtpHash())) {
            pending.setAttempts(pending.getAttempts() + 1);
            resetOtpRepository.saveAndFlush(pending);
            return false;
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElse(null);

        if (user == null ||
                !Boolean.TRUE.equals(user.getActive()) ||
                !Boolean.TRUE.equals(user.getEmailVerified())) {
            resetOtpRepository.delete(pending);
            return false;
        }

        user.setPassword(passwordEncoder.encode(newPassword));

        userRepository.save(user);
        resetOtpRepository.delete(pending);

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
