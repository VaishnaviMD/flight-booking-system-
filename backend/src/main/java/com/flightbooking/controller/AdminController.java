package com.flightbooking.controller;

import com.flightbooking.dto.response.BookingResponse;
import com.flightbooking.dto.response.FlightResponse;
import com.flightbooking.dto.response.UserResponse;
import com.flightbooking.model.FlightStatus;
import com.flightbooking.repository.BookingRepository;
import com.flightbooking.repository.FlightRepository;
import com.flightbooking.service.BookingService;
import com.flightbooking.service.FlightService;
import com.flightbooking.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final BookingService bookingService;
    private final FlightService flightService;
    private final UserService userService;
    private final BookingRepository bookingRepository;
    private final FlightRepository flightRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(Map.of(
                "totalBookings", bookingRepository.count(),
                "confirmedBookings", bookingRepository.countConfirmed(),
                "totalRevenue", bookingRepository.sumRevenue(),
                "totalFlights", flightRepository.count(),
                "scheduledFlights", flightRepository.countByStatus(FlightStatus.SCHEDULED)
        ));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/flights")
    public ResponseEntity<List<FlightResponse>> getAllFlights() {
        return ResponseEntity.ok(flightService.getAll());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
