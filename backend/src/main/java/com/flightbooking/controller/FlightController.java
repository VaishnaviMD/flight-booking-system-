package com.flightbooking.controller;

import com.flightbooking.dto.request.FlightSearchRequest;
import com.flightbooking.dto.response.FlightResponse;
import com.flightbooking.model.Airline;
import com.flightbooking.model.Airport;
import com.flightbooking.repository.AirlineRepository;
import com.flightbooking.repository.AirportRepository;
import com.flightbooking.service.FlightService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Flights", description = "Flight search, details and reference data")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FlightController {

    private final FlightService flightService;
    private final AirportRepository airportRepository;
    private final AirlineRepository airlineRepository;

    @Operation(summary = "Search flights by route, date, passengers and optional filters")
    @GetMapping("/flights/search")
    public ResponseEntity<List<FlightResponse>> search(FlightSearchRequest request) {
        return ResponseEntity.ok(flightService.searchFlights(request));
    }

    @Operation(summary = "Get complete details of a single flight by id")
    @GetMapping("/flights/{id}")
    public ResponseEntity<FlightResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(flightService.getById(id));
    }

    @Operation(summary = "List all airports (used by the search dropdowns)")
    @GetMapping("/airports")
    public ResponseEntity<List<Airport>> getAirports() {
        return ResponseEntity.ok(airportRepository.findAll());
    }

    @Operation(summary = "List all airlines")
    @GetMapping("/airlines")
    public ResponseEntity<List<Airline>> getAirlines() {
        return ResponseEntity.ok(airlineRepository.findAll());
    }
}
