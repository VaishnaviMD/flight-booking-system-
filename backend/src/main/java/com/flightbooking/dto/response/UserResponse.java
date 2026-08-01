package com.flightbooking.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class UserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role;
}
