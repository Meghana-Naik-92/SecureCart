package com.securecart.service.impl;

import com.securecart.dto.RegisterRequest;
import com.securecart.dto.UserResponse;
import com.securecart.entity.Role;
import com.securecart.entity.User;
import com.securecart.exception.BadRequestException;
import com.securecart.repository.UserRepository;
import com.securecart.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.securecart.dto.LoginRequest;
import com.securecart.dto.AuthResponse;
import com.securecart.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager, JwtUtil jwtUtil,
                           UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public UserResponse registerUser(RegisterRequest request) {
        // 1. Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered!");
        }

        // 2. Create new User entity
        User user = new User();
        user.setEmail(request.getEmail());
        // 3. Hash the password before saving
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        // By default, a new registered user gets the CUSTOMER role
        user.setRole(Role.USER);

        // 4. Save to database
        User savedUser = userRepository.save(user);

        // 5. Return safe DTO (without password)
        return new UserResponse(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getCreatedAt()
        );
    }

    @Override
    public AuthResponse loginUser(LoginRequest request) {
        // Authenticate the user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // Fetch UserDetails
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());

        // Generate tokens
        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return new AuthResponse(accessToken, refreshToken);
    }
}
