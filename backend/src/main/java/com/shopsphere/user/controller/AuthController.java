
package com.shopsphere.user.controller;

import com.shopsphere.user.dto.AuthResponse;
import com.shopsphere.user.dto.LoginRequest;
import com.shopsphere.user.dto.RegisterRequest;
import com.shopsphere.user.dto.ResendOtpRequest;
import com.shopsphere.user.dto.VerifyOtpRequest;
import com.shopsphere.user.dto.ForgotPasswordRequest;
import com.shopsphere.user.dto.VerifyResetOtpRequest;
import com.shopsphere.user.dto.ResetTokenResponse;
import com.shopsphere.user.dto.ResetPasswordTokenRequest;

import com.shopsphere.user.service.AuthService;
import com.shopsphere.user.service.EmailOtpService;
import com.shopsphere.user.service.PasswordResetService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final EmailOtpService emailOtpService;
    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(
            EmailOtpService emailOtpService,
            AuthService authService,
            PasswordResetService passwordResetService
    ) {
        this.emailOtpService = emailOtpService;
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        emailOtpService.startRegistration(
                request.getFullName(),
                request.getEmail(),
                request.getPassword()
        );

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(
                Map.of(
                        "message",
                        "OTP sent successfully. Please verify your email.",
                        "email",
                        request.getEmail().trim().toLowerCase()
                )
        );
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request
    ) {
        boolean verified = emailOtpService.verifyOtp(
                request.getEmail(),
                request.getOtp()
        );

        if (!verified) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Invalid or expired OTP. Please try again or request a new OTP."
                    )
            );
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "message",
                        "Email verified and account created successfully.",
                        "email",
                        request.getEmail().trim().toLowerCase()
                )
        );
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, String>> resendOtp(
            @Valid @RequestBody ResendOtpRequest request
    ) {
        emailOtpService.resendOtp(request.getEmail());

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "A new verification OTP has been sent.",
                        "email",
                        request.getEmail().trim().toLowerCase()
                )
        );
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        passwordResetService.sendResetOtp(request.getEmail());

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "If an active account exists for this email, a password reset OTP has been sent."
                )
        );
    }

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<?> verifyResetOtp(
            @Valid @RequestBody VerifyResetOtpRequest request
    ) {
        String resetToken = passwordResetService.verifyResetOtp(
                request.getEmail(),
                request.getOtp()
        );

        if (resetToken == null) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Invalid or expired OTP. Please try again."
                    )
            );
        }

        return ResponseEntity.ok(
                new ResetTokenResponse(
                        "OTP verified successfully.",
                        resetToken
                )
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordTokenRequest request
    ) {
        boolean reset = passwordResetService.resetPassword(
                request.getResetToken(),
                request.getNewPassword()
        );

        if (!reset) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Invalid, expired, or already used reset token. Please restart password recovery."
                    )
            );
        }

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Password reset successfully. Please log in with your new password."
                )
        );
    }
}
