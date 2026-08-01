package com.flightbooking.service;

import com.flightbooking.dto.response.UserResponse;
import com.flightbooking.model.User;

import java.util.List;

public interface UserService {
    UserResponse getProfile(String email);
    UserResponse updateProfile(String email, UserResponse request);
    List<UserResponse> getAllUsers();
    void changePassword(String email, String oldPassword, String newPassword);
}
