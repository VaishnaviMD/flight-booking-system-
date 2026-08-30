package com.flightbooking.security;

import com.flightbooking.model.Role;
import com.flightbooking.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtUtil, "expirationMs", 86400000L);
        ReflectionTestUtils.setField(jwtUtil, "refreshExpirationMs", 604800000L);
    }

    @Test
    void generateTokenAndValidateSuccessfully() {
        User user = User.builder()
                .id(1L)
                .email("testuser@skyflow.com")
                .firstName("Test")
                .lastName("User")
                .role(Role.USER)
                .build();

        String token = jwtUtil.generateToken(user);

        assertNotNull(token);
        assertFalse(token.isBlank());
        assertTrue(jwtUtil.isTokenValid(token, user));
        assertEquals("testuser@skyflow.com", jwtUtil.extractUsername(token));
    }

    @Test
    void generateRefreshTokenAndValidateSuccessfully() {
        User user = User.builder()
                .id(2L)
                .email("admin@skyflow.com")
                .role(Role.ADMIN)
                .build();

        String refreshToken = jwtUtil.generateRefreshToken(user);

        assertNotNull(refreshToken);
        assertTrue(jwtUtil.isTokenValid(refreshToken, user));
        assertEquals("admin@skyflow.com", jwtUtil.extractUsername(refreshToken));
    }

    @Test
    void isTokenValidShouldReturnFalseForDifferentUser() {
        User user1 = User.builder().email("user1@skyflow.com").build();
        User user2 = User.builder().email("user2@skyflow.com").build();

        String token = jwtUtil.generateToken(user1);

        assertFalse(jwtUtil.isTokenValid(token, user2));
    }
}
