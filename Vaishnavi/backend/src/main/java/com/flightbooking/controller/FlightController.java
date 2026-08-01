package com.flightbooking.controller;

import com.flightbooking.dto.request.FlightSearchRequest;
import com.flightbooking.dto.response.FlightResponse;
import com.flightbooking.model.Airline;
import com.flightbooking.model.Airport;
import com.flightbooking.repository.AirlineRepository;
import com.flightbooking.repository.AirportRepository;
import com.flightbooking.service.FlightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FlightController {

    private final FlightService flightService;
    private final AirportRepository airportRepository;
    private final AirlineRepository airlineRepository;

    @GetMapping("/flights/search")
    public ResponseEntity<List<FlightResponse>> search(FlightSearchRequest request) {
        return ResponseEntity.ok(flightService.searchFlights(request));
    }

    @GetMapping("/flights/{id}")
    public ResponseEntity<FlightResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(flightService.getById(id));
    }

    @GetMapping("/airports")
    public ResponseEntity<List<Airport>> getAirports() {
        return ResponseEntity.ok(airportRepository.findAll());
    }

    @GetMapping("/airlines")
    public ResponseEntity<List<Airline>> getAirlines() {
        return ResponseEntity.ok(airlineRepository.findAll());
    }
}
