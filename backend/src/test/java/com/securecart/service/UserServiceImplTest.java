package com.securecart.service;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.securecart.dto.AuthResponse;
import com.securecart.dto.LoginRequest;
import com.securecart.dto.RegisterRequest;
import com.securecart.dto.UserResponse;
import com.securecart.entity.Role;
import com.securecart.entity.User;
import com.securecart.exception.BadRequestException;
import com.securecart.repository.UserRepository;
import com.securecart.security.JwtUtil;
import com.securecart.service.impl.UserServiceImpl;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserDetailsService userDetailsService;

    @InjectMocks
    private UserServiceImpl userService;

    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setName("Test User");
        testUser.setGender("Male");
        testUser.setPassword("hashedpassword");
        testUser.setRole(Role.USER);
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setUpdatedAt(LocalDateTime.now());

        registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@example.com");
        registerRequest.setName("Test User");
        registerRequest.setGender("Male");
        registerRequest.setPassword("password123");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");
    }

    // ── REGISTRATION TESTS ──────────────────────────────────
    @Test
    void registerUser_Success() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedpassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        UserResponse response = userService.registerUser(registerRequest);

        // Assert
        assertNotNull(response);
        assertEquals("test@example.com", response.getEmail());
        assertEquals("Test User", response.getName());
        assertEquals("Male", response.getGender());
        assertEquals(Role.USER, response.getRole());
        verify(passwordEncoder, times(1)).encode("password123");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void registerUser_DuplicateEmail_ThrowsBadRequestException() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // Act & Assert
        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> userService.registerUser(registerRequest)
        );
        assertEquals("Email is already registered!", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerUser_PasswordIsHashed() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$hashedvalue");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        userService.registerUser(registerRequest);

        // Assert — raw password never saved
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(argThat(user
                -> !user.getPassword().equals("password123")
        ));
    }

    // ── LOGIN TESTS ──────────────────────────────────────────
    @Test
    void loginUser_Success() {
        // Arrange
        UserDetails mockUserDetails = mock(UserDetails.class);
        when(authenticationManager.authenticate(any())).thenReturn(
                new UsernamePasswordAuthenticationToken("test@example.com", "password123")
        );
        when(userDetailsService.loadUserByUsername(anyString()))
                .thenReturn(mockUserDetails);

        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(testUser));

        when(passwordEncoder.matches(anyString(), anyString()))
                .thenReturn(true);

        when(jwtUtil.generateAccessToken(any(UserDetails.class), anyString()))
                .thenReturn("access-token");

        when(jwtUtil.generateRefreshToken(any()))
                .thenReturn("refresh-token");

        // Act
        AuthResponse response = userService.loginUser(loginRequest);

        // Assert
        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
    }

    @Test
    void loginUser_WrongPassword_ThrowsBadRequestException() {
        // Arrange
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString()))
                .thenReturn(false);

        // Act & Assert
        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> userService.loginUser(loginRequest)
        );
        assertEquals("Invalid password", exception.getMessage());
    }
}
