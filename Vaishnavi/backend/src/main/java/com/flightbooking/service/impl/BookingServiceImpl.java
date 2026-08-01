package com.flightbooking.service.impl;

import com.flightbooking.dto.request.BookingRequest;
import com.flightbooking.dto.response.BookingResponse;
import com.flightbooking.exception.AppException;
import com.flightbooking.model.*;
import com.flightbooking.repository.BookingRepository;
import com.flightbooking.repository.FlightRepository;
import com.flightbooking.repository.UserRepository;
import com.flightbooking.service.BookingService;
import com.flightbooking.service.FlightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final FlightRepository flightRepository;
    private final UserRepository userRepository;
    private final FlightService flightService;

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest req, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Flight flight = flightRepository.findById(req.getFlightId())
                .orElseThrow(() -> new AppException("Flight not found", HttpStatus.NOT_FOUND));

        int passengerCount = req.getPassengerCount() != null ? req.getPassengerCount() : req.getPassengers().size();
        if (flight.getAvailableSeats() < passengerCount) {
            throw new AppException("Not enough seats available", HttpStatus.BAD_REQUEST);
        }

        Flight returnFlight = null;
        if (req.getReturnFlightId() != null) {
            returnFlight = flightRepository.findById(req.getReturnFlightId())
                    .orElseThrow(() -> new AppException("Return flight not found", HttpStatus.NOT_FOUND));
        }

        BigDecimal total = flight.getBasePrice().multiply(BigDecimal.valueOf(passengerCount));
        if (returnFlight != null) {
            total = total.add(returnFlight.getBasePrice().multiply(BigDecimal.valueOf(passengerCount)));
        }

        CabinClass cabinClass = CabinClass.valueOf(req.getCabinClass().toUpperCase());
        String pnr = "FB" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Booking booking = Booking.builder()
                .pnr(pnr)
                .user(user)
                .flight(flight)
                .returnFlight(returnFlight)
                .cabinClass(cabinClass)
                .totalAmount(total)
                .status(BookingStatus.CONFIRMED)
                .build();

        List<Passenger> passengers = req.getPassengers().stream().map(p -> Passenger.builder()
                .booking(booking)
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .dateOfBirth(p.getDateOfBirth())
                .passportNumber(p.getPassportNumber())
                .seatNumber(p.getSeatNumber())
                .type(p.getType() != null ? PassengerType.valueOf(p.getType().toUpperCase()) : PassengerType.ADULT)
                .build()).collect(Collectors.toList());

        booking.setPassengers(passengers);

        flight.setAvailableSeats(flight.getAvailableSeats() - passengerCount);
        flightRepository.save(flight);

        return toResponse(bookingRepository.save(booking));
    }

    @Override
    public List<BookingResponse> getMyBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        return bookingRepository.findByUserOrderByBookedAtDesc(user)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public BookingResponse getByPnr(String pnr) {
        return toResponse(bookingRepository.findByPnr(pnr)
                .orElseThrow(() -> new AppException("Booking not found", HttpStatus.NOT_FOUND)));
    }

    @Override
    public BookingResponse getById(Long id) {
        return toResponse(bookingRepository.findById(id)
                .orElseThrow(() -> new AppException("Booking not found", HttpStatus.NOT_FOUND)));
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException("Booking not found", HttpStatus.NOT_FOUND));
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new AppException("Unauthorized", HttpStatus.FORBIDDEN);
        }
        booking.setStatus(BookingStatus.CANCELLED);
        Flight flight = booking.getFlight();
        flight.setAvailableSeats(flight.getAvailableSeats() + booking.getPassengers().size());
        flightRepository.save(flight);
        return toResponse(bookingRepository.save(booking));
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    private BookingResponse toResponse(Booking b) {
        List<BookingResponse.PassengerResponse> passengerResponses = b.getPassengers().stream()
                .map(p -> BookingResponse.PassengerResponse.builder()
                        .firstName(p.getFirstName())
                        .lastName(p.getLastName())
                        .seatNumber(p.getSeatNumber())
                        .type(p.getType() != null ? p.getType().name() : "ADULT")
                        .build())
                .collect(Collectors.toList());

        return BookingResponse.builder()
                .id(b.getId())
                .pnr(b.getPnr())
                .status(b.getStatus().name())
                .flight(flightService.toResponse(b.getFlight()))
                .returnFlight(b.getReturnFlight() != null ? flightService.toResponse(b.getReturnFlight()) : null)
                .cabinClass(b.getCabinClass().name())
                .totalAmount(b.getTotalAmount())
                .totalPrice(b.getTotalAmount())
                .bookedAt(b.getBookedAt())
                .createdAt(b.getBookedAt().toString())
                .passengers(passengerResponses)
                .build();
    }
}
