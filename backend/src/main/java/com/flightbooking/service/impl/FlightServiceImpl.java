package com.flightbooking.service.impl;

import com.flightbooking.dto.request.FlightSearchRequest;
import com.flightbooking.dto.response.FlightResponse;
import com.flightbooking.exception.AppException;
import com.flightbooking.model.Airline;
import com.flightbooking.model.Airport;
import com.flightbooking.model.CabinClass;
import com.flightbooking.model.Flight;
import com.flightbooking.model.FlightStatus;
import com.flightbooking.repository.AirlineRepository;
import com.flightbooking.repository.AirportRepository;
import com.flightbooking.repository.FlightRepository;
import com.flightbooking.service.FlightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlightServiceImpl implements FlightService {

    private final FlightRepository flightRepository;
    private final AirportRepository airportRepository;
    private final AirlineRepository airlineRepository;

    @Override
    public List<FlightResponse> searchFlights(FlightSearchRequest req) {
        if (req.getDepartureDate() == null) {
            return List.of();
        }

        LocalDateTime from = req.getDepartureDate().atStartOfDay();
        LocalDateTime to = req.getDepartureDate().atTime(23, 59, 59);
        List<Flight> flights = flightRepository.searchFlights(
                req.getOrigin(), req.getDestination(), from, to,
                req.getPassengers() > 0 ? req.getPassengers() : 1
        );

        var stream = flights.stream();

        if (req.getCabinClass() != null && !req.getCabinClass().isBlank())
            stream = stream.filter(f -> f.getCabinClass().name().equalsIgnoreCase(req.getCabinClass()));
        if (req.getMinPrice() != null)
            stream = stream.filter(f -> f.getBasePrice().doubleValue() >= req.getMinPrice());
        if (req.getMaxPrice() != null)
            stream = stream.filter(f -> f.getBasePrice().doubleValue() <= req.getMaxPrice());
        if (req.getMaxStops() != null)
            stream = stream.filter(f -> f.getStops() <= req.getMaxStops());
        if (req.getAirlineCode() != null && !req.getAirlineCode().isBlank())
            stream = stream.filter(f -> f.getAirline().getCode().equalsIgnoreCase(req.getAirlineCode()));

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
        String airlineCode = request.getAirlineCode() != null ? request.getAirlineCode().toUpperCase().trim() : "6E";
        String originCode = request.getOriginCode() != null ? request.getOriginCode().toUpperCase().trim() : "DEL";
        String destCode = request.getDestinationCode() != null ? request.getDestinationCode().toUpperCase().trim() : "BOM";

        Airline airline = airlineRepository.findById(airlineCode)
                .orElseGet(() -> airlineRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new AppException("No airline found in system", HttpStatus.BAD_REQUEST)));

        Airport origin = airportRepository.findById(originCode)
                .orElseThrow(() -> new AppException("Origin airport not found with code: " + originCode, HttpStatus.BAD_REQUEST));

        Airport destination = airportRepository.findById(destCode)
                .orElseThrow(() -> new AppException("Destination airport not found with code: " + destCode, HttpStatus.BAD_REQUEST));

        LocalDateTime dep = request.getDepartureTime() != null ? request.getDepartureTime() : LocalDateTime.now().plusDays(1).withHour(9).withMinute(0);
        LocalDateTime arr = request.getArrivalTime() != null ? request.getArrivalTime() : dep.plusHours(2).plusMinutes(15);

        int duration = request.getDurationMinutes() > 0 ?
                request.getDurationMinutes() :
                (int) Math.max(30, Duration.between(dep, arr).toMinutes());

        CabinClass cabin = CabinClass.ECONOMY;
        if (request.getCabinClass() != null) {
            try {
                cabin = CabinClass.valueOf(request.getCabinClass().toUpperCase());
            } catch (Exception ignored) {}
        }

        FlightStatus status = FlightStatus.SCHEDULED;
        if (request.getStatus() != null) {
            try {
                status = FlightStatus.valueOf(request.getStatus().toUpperCase());
            } catch (Exception ignored) {}
        }

        int totalSeats = request.getTotalSeats() > 0 ? request.getTotalSeats() : 180;
        int availSeats = request.getAvailableSeats() > 0 ? request.getAvailableSeats() : totalSeats;

        Flight flight = Flight.builder()
                .flightNumber(request.getFlightNumber() != null && !request.getFlightNumber().isBlank() ?
                        request.getFlightNumber().trim().toUpperCase() :
                        airline.getCode() + "-" + (int)(Math.random() * 8000 + 1000))
                .airline(airline)
                .origin(origin)
                .destination(destination)
                .departureTime(dep)
                .arrivalTime(arr)
                .durationMinutes(duration)
                .basePrice(request.getBasePrice() != null ? request.getBasePrice() : BigDecimal.valueOf(4899))
                .totalSeats(totalSeats)
                .availableSeats(availSeats)
                .stops(request.getStops())
                .cabinClass(cabin)
                .status(status)
                .aircraftType(request.getAircraftType() != null && !request.getAircraftType().isBlank() ? request.getAircraftType() : "Airbus A320neo")
                .baggageCheckin(request.getBaggageCheckin() != null ? request.getBaggageCheckin() : "15 Kg")
                .baggageCabin(request.getBaggageCabin() != null ? request.getBaggageCabin() : "7 Kg")
                .mealIncluded(request.getMealIncluded() != null ? request.getMealIncluded() : false)
                .refundable(request.getRefundable() != null ? request.getRefundable() : true)
                .fareRules(request.getFareRules() != null ? request.getFareRules() : "Standard SkyFlow fare rules apply")
                .build();

        Flight saved = flightRepository.save(flight);
        return toResponse(saved);
    }

    @Override
    public FlightResponse update(Long id, FlightResponse request) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new AppException("Flight not found with ID: " + id, HttpStatus.NOT_FOUND));

        if (request.getStatus() != null) {
            try {
                flight.setStatus(FlightStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (Exception ignored) {}
        }
        if (request.getBasePrice() != null) {
            flight.setBasePrice(request.getBasePrice());
        }
        if (request.getAvailableSeats() > 0) {
            flight.setAvailableSeats(request.getAvailableSeats());
        }
        Flight updated = flightRepository.save(flight);
        return toResponse(updated);
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
                .airlineCode(f.getAirline() != null ? f.getAirline().getCode() : "6E")
                .airlineName(f.getAirline() != null ? f.getAirline().getName() : "SkyFlow Partner")
                .airlineLogoUrl(f.getAirline() != null ? f.getAirline().getLogoUrl() : "")
                .originCode(f.getOrigin() != null ? f.getOrigin().getCode() : "DEL")
                .originCity(f.getOrigin() != null ? f.getOrigin().getCity() : "New Delhi")
                .originName(f.getOrigin() != null ? f.getOrigin().getName() : "Airport")
                .destinationCode(f.getDestination() != null ? f.getDestination().getCode() : "BOM")
                .destinationCity(f.getDestination() != null ? f.getDestination().getCity() : "Mumbai")
                .destinationName(f.getDestination() != null ? f.getDestination().getName() : "Airport")
                .departureTime(f.getDepartureTime())
                .arrivalTime(f.getArrivalTime())
                .durationMinutes(f.getDurationMinutes())
                .stops(f.getStops())
                .basePrice(f.getBasePrice())
                .totalSeats(f.getTotalSeats() != null ? f.getTotalSeats() : 180)
                .availableSeats(f.getAvailableSeats())
                .cabinClass(f.getCabinClass() != null ? f.getCabinClass().name() : "ECONOMY")
                .status(f.getStatus() != null ? f.getStatus().name() : "SCHEDULED")
                .aircraftType(f.getAircraftType())
                .baggageCheckin(f.getBaggageCheckin())
                .baggageCabin(f.getBaggageCabin())
                .mealIncluded(f.getMealIncluded())
                .refundable(f.getRefundable())
                .fareRules(f.getFareRules())
                .build();
    }
}
