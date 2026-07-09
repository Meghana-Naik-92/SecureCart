package com.securecart.service;

import com.securecart.dto.RegisterRequest;
import com.securecart.dto.UserResponse;

import com.securecart.dto.LoginRequest;
import com.securecart.dto.AuthResponse;

public interface UserService {
    UserResponse registerUser(RegisterRequest request);
    AuthResponse loginUser(LoginRequest request);
}
