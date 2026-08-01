package com.flightbooking.service;

import com.flightbooking.dto.request.FlightSearchRequest;
import com.flightbooking.dto.response.FlightResponse;
import com.flightbooking.model.Flight;

import java.util.List;

public interface FlightService {
    List<FlightResponse> searchFlights(FlightSearchRequest request);
    FlightResponse getById(Long id);
    List<FlightResponse> getAll();
    FlightResponse create(FlightResponse request);
    FlightResponse update(Long id, FlightResponse request);
    void delete(Long id);
    FlightResponse toResponse(Flight flight);
}
