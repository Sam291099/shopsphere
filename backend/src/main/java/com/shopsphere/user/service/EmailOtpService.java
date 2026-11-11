
package com.shopsphere.user.service;

import com.shopsphere.user.entity.EmailVerificationOtp;
import com.shopsphere.user.repository.EmailVerificationOtpRepository;
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
public class EmailOtpService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final EmailVerificationOtpRepository otpRepository;
    private final UserRepository userRepository;
    private final UserService userService;
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

    public EmailOtpService(
            EmailVerificationOtpRepository otpRepository,
            UserRepository userRepository,
            UserService userService,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender
    ) {
        this.otpRepository = otpRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    @Transactional
    public void startRegistration(
            String fullName,
            String email,
            String rawPassword
    ) {
        String normalizedEmail = normalizeEmail(email);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        LocalDateTime now = LocalDateTime.now();

        EmailVerificationOtp pending = otpRepository
                .findByEmail(normalizedEmail)
                .orElseGet(EmailVerificationOtp::new);

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
        pending.setFullName(fullName.trim());
        pending.setPasswordHash(passwordEncoder.encode(rawPassword));
        pending.setOtpHash(passwordEncoder.encode(otp));
        pending.setExpiresAt(now.plusMinutes(expirationMinutes));
        pending.setLastSentAt(now);
        pending.setAttempts(0);

        otpRepository.save(pending);

        sendOtpEmail(normalizedEmail, fullName.trim(), otp);
    }

    @Transactional
    public boolean verifyOtp(String email, String otp) {

        String normalizedEmail = normalizeEmail(email);

        EmailVerificationOtp pending = otpRepository
                .findByEmail(normalizedEmail)
                .orElse(null);

        if (pending == null) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();

        if (!pending.getExpiresAt().isAfter(now)) {
            otpRepository.delete(pending);
            return false;
        }

        if (pending.getAttempts() >= maxAttempts) {
            otpRepository.delete(pending);
            return false;
        }

        if (!passwordEncoder.matches(otp, pending.getOtpHash())) {

            pending.setAttempts(pending.getAttempts() + 1);
            otpRepository.saveAndFlush(pending);

            return false;
        }

        userService.createVerifiedCustomer(
                pending.getFullName(),
                pending.getEmail(),
                pending.getPasswordHash()
        );

        otpRepository.delete(pending);

        return true;
    }

    @Transactional
    public void resendOtp(String email) {

        String normalizedEmail = normalizeEmail(email);

        EmailVerificationOtp pending = otpRepository
                .findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No pending registration found. Please register again."
                        )
                );

        LocalDateTime now = LocalDateTime.now();

        if (pending.getLastSentAt().plusSeconds(
                resendCooldownSeconds
        ).isAfter(now)) {
            throw new IllegalArgumentException(
                    "Please wait before requesting another OTP."
            );
        }

        if (userRepository.existsByEmail(normalizedEmail)) {
            otpRepository.delete(pending);
            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        String otp = generateOtp();

        pending.setOtpHash(passwordEncoder.encode(otp));
        pending.setExpiresAt(now.plusMinutes(expirationMinutes));
        pending.setLastSentAt(now);
        pending.setAttempts(0);

        otpRepository.save(pending);

        sendOtpEmail(
                normalizedEmail,
                pending.getFullName(),
                otp
        );
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
        message.setSubject("ShopSphere - Email Verification OTP");

        message.setText(
                "Hello " + fullName + ",\n\n" +
                "Thank you for registering with ShopSphere!\n\n" +
                "Your email verification OTP is: " + otp + "\n\n" +
                "This OTP expires in " + expirationMinutes + " minutes.\n" +
                "You can request another OTP after " +
                resendCooldownSeconds + " seconds.\n\n" +
                "If you did not request this verification, please ignore this email.\n\n" +
                "Regards,\nShopSphere Team"
        );

        mailSender.send(message);
    }
}
