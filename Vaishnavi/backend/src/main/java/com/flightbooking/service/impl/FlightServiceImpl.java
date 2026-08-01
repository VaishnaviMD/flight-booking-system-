package com.flightbooking.service.impl;

import com.flightbooking.dto.request.FlightSearchRequest;
import com.flightbooking.dto.response.FlightResponse;
import com.flightbooking.exception.AppException;
import com.flightbooking.model.Flight;
import com.flightbooking.repository.FlightRepository;
import com.flightbooking.service.FlightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlightServiceImpl implements FlightService {

    private final FlightRepository flightRepository;

    @Override
    public List<FlightResponse> searchFlights(FlightSearchRequest req) {
        List<Flight> flights;

        if (req.getDepartureDate() != null) {
            LocalDateTime from = req.getDepartureDate().atStartOfDay();
            LocalDateTime to = req.getDepartureDate().atTime(23, 59, 59);
            flights = flightRepository.searchFlights(
                    req.getOrigin(), req.getDestination(), from, to,
                    req.getPassengers() > 0 ? req.getPassengers() : 1
            );
        } else {
            flights = List.of();
        }

        // Fallback: If no flights match exact departure date, return flights matching origin & destination
        if (flights.isEmpty()) {
            flights = flightRepository.findAll().stream()
                    .filter(f -> req.getOrigin() == null || req.getOrigin().isBlank() || f.getOrigin().getCode().equalsIgnoreCase(req.getOrigin()))
                    .filter(f -> req.getDestination() == null || req.getDestination().isBlank() || f.getDestination().getCode().equalsIgnoreCase(req.getDestination()))
                    .collect(Collectors.toList());
        }

        // Double Fallback: If still empty (e.g. invalid airport pair), return all available flights
        if (flights.isEmpty()) {
            flights = flightRepository.findAll();
        }

        // Apply optional filters
        var stream = flights.stream();

        if (req.getMinPrice() != null)
            stream = stream.filter(f -> f.getBasePrice().doubleValue() >= req.getMinPrice());
        if (req.getMaxPrice() != null)
            stream = stream.filter(f -> f.getBasePrice().doubleValue() <= req.getMaxPrice());
        if (req.getMaxStops() != null)
            stream = stream.filter(f -> f.getStops() <= req.getMaxStops());
        if (req.getAirlineCode() != null && !req.getAirlineCode().isBlank())
            stream = stream.filter(f -> f.getAirline().getCode().equalsIgnoreCase(req.getAirlineCode()));

        // Sorting
        String sortBy = req.getSortBy() != null ? req.getSortBy() : "price";
        Comparator<Flight> comparator = switch (sortBy) {
            case "duration" -> Comparator.comparing(Flight::getDurationMinutes);
            case "departure" -> Comparator.comparing(Flight::getDepartureTime);
            case "arrival" -> Comparator.comparing(Flight::getArrivalTime);
            default -> Comparator.comparing(Flight::getBasePrice);
        };
        if ("desc".equals(req.getSortDir())) comparator = comparator.reversed();
        stream = stream.sorted(comparator);

        return stream.map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public FlightResponse getById(Long id) {
        return toResponse(flightRepository.findById(id)
                .orElseThrow(() -> new AppException("Flight not found", HttpStatus.NOT_FOUND)));
    }

    @Override
    public List<FlightResponse> getAll() {
        return flightRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public FlightResponse create(FlightResponse request) {
        throw new UnsupportedOperationException("Use admin flight creation endpoint");
    }

    @Override
    public FlightResponse update(Long id, FlightResponse request) {
        throw new UnsupportedOperationException("Use admin flight update endpoint");
    }

    @Override
    public void delete(Long id) {
        flightRepository.deleteById(id);
    }

    @Override
    public FlightResponse toResponse(Flight f) {
        return FlightResponse.builder()
                .id(f.getId())
                .flightNumber(f.getFlightNumber())
                .airlineCode(f.getAirline().getCode())
                .airlineName(f.getAirline().getName())
                .airlineLogoUrl(f.getAirline().getLogoUrl())
                .originCode(f.getOrigin().getCode())
                .originCity(f.getOrigin().getCity())
                .originName(f.getOrigin().getName())
                .destinationCode(f.getDestination().getCode())
                .destinationCity(f.getDestination().getCity())
                .destinationName(f.getDestination().getName())
                .departureTime(f.getDepartureTime())
                .arrivalTime(f.getArrivalTime())
                .durationMinutes(f.getDurationMinutes())
                .stops(f.getStops())
                .basePrice(f.getBasePrice())
                .availableSeats(f.getAvailableSeats())
                .cabinClass(f.getCabinClass().name())
                .status(f.getStatus().name())
                .build();
    }
}
