package com.flightbooking.controller;

import com.flightbooking.dto.response.BookingResponse;
import com.flightbooking.dto.response.FlightResponse;
import com.flightbooking.dto.response.UserResponse;
import com.flightbooking.exception.AppException;
import com.flightbooking.model.Flight;
import com.flightbooking.model.FlightStatus;
import com.flightbooking.repository.BookingRepository;
import com.flightbooking.repository.FlightRepository;
import com.flightbooking.service.BookingService;
import com.flightbooking.service.FlightService;
import com.flightbooking.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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

    @PostMapping("/flights")
    public ResponseEntity<FlightResponse> createFlight(@RequestBody FlightResponse request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(flightService.create(request));
    }

    @PatchMapping("/flights/{id}/status")
    public ResponseEntity<FlightResponse> updateFlightStatus(@PathVariable Long id, @RequestParam String status) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new AppException("Flight not found with ID: " + id, HttpStatus.NOT_FOUND));
        try {
            flight.setStatus(FlightStatus.valueOf(status.toUpperCase().trim()));
            flightRepository.save(flight);
        } catch (IllegalArgumentException e) {
            throw new AppException("Invalid status: " + status + ". Allowed: SCHEDULED, DELAYED, CANCELLED, COMPLETED, IN_AIR", HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok(flightService.toResponse(flight));
    }

    @DeleteMapping("/flights/{id}")
    public ResponseEntity<Map<String, String>> deleteFlight(@PathVariable Long id) {
        flightService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Flight " + id + " deleted successfully"));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
