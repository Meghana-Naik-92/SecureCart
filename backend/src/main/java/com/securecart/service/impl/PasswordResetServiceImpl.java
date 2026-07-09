package com.securecart.service.impl;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.securecart.entity.PasswordResetToken;
import com.securecart.entity.User;
import com.securecart.exception.BadRequestException;
import com.securecart.repository.PasswordResetTokenRepository;
import com.securecart.repository.UserRepository;
import com.securecart.service.PasswordResetService;

@Service
public class PasswordResetServiceImpl implements PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetServiceImpl(UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void forgotPassword(String email) {
        // Silently ignore if email not found — security best practice
        // Never reveal whether an email exists in the system
        userRepository.findByEmail(email).ifPresent(user -> {

            // Delete any existing tokens for this user
            tokenRepository.deleteByUserId(user.getId());

            // Generate secure random token
            String token = UUID.randomUUID().toString();

            // Set expiry to 30 minutes from now
            LocalDateTime expiry = LocalDateTime.now().plusMinutes(30);

            // Save token
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUser(user);
            resetToken.setToken(token);
            resetToken.setExpiryDate(expiry);
            resetToken.setUsed(false);
            tokenRepository.save(resetToken);

            // In production this would be an email
            // For dev we print to console
            System.out.println("===========================================");
            System.out.println("PASSWORD RESET TOKEN FOR: " + email);
            System.out.println("TOKEN: " + token);
            System.out.println("EXPIRES AT: " + expiry);
            System.out.println("===========================================");
        });
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        // Find token
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException(
                "Invalid or expired password reset token"));

        // Check if already used
        if (resetToken.isUsed()) {
            throw new BadRequestException(
                    "This password reset token has already been used");
        }

        // Check if expired
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException(
                    "Password reset token has expired. Please request a new one");
        }

        // Update password
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used — single use enforcement
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
}
