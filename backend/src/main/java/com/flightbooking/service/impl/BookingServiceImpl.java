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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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
        User user = userRepository.findByEmailIgnoreCase(userEmail.trim())
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
                .contactEmail(req.getContactEmail())
                .contactPhone(req.getContactPhone())
                .build();

        List<Passenger> passengers = req.getPassengers().stream().map(p -> Passenger.builder()
                .booking(booking)
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .dateOfBirth(p.getDateOfBirth())
                .age(p.getAge())
                .gender(p.getGender())
                .nationality(p.getNationality())
                .passportNumber(p.getPassportNumber())
                .mealPreference(p.getMealPreference())
                .seatPreference(p.getSeatPreference())
                .specialAssistance(p.getSpecialAssistance())
                .emergencyContactName(p.getEmergencyContactName())
                .emergencyContactPhone(p.getEmergencyContactPhone())
                .seatNumber(p.getSeatNumber())
                .type(p.getType() != null ? PassengerType.valueOf(p.getType().toUpperCase()) : PassengerType.ADULT)
                .ticketNumber(generateTicketNumber())
                .build()).collect(Collectors.toList());

        booking.setPassengers(passengers);

        flight.setAvailableSeats(flight.getAvailableSeats() - passengerCount);
        flightRepository.save(flight);

        return toResponse(bookingRepository.save(booking));
    }

    @Override
    public List<BookingResponse> getMyBookings(String userEmail) {
        User user = userRepository.findByEmailIgnoreCase(userEmail.trim())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        return bookingRepository.findByUserOrderByBookedAtDesc(user)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public BookingResponse getByPnr(String pnr, String userEmail) {
        return toResponse(getOwnedBooking(bookingRepository.findByPnr(pnr), userEmail, "Booking not found"));
    }

    @Override
    public BookingResponse getById(Long id, String userEmail) {
        return toResponse(getOwnedBooking(bookingRepository.findById(id), userEmail, "Booking not found"));
    }

    /**
     * Fetches a booking and verifies the caller owns it (or is an ADMIN).
     * Prevents any authenticated user from reading someone else's booking.
     */
    private Booking getOwnedBooking(Optional<Booking> booking, String userEmail, String notFoundMessage) {
        User caller = userRepository.findByEmailIgnoreCase(userEmail.trim())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        Booking b = booking.orElseThrow(() -> new AppException(notFoundMessage, HttpStatus.NOT_FOUND));
        boolean isOwner = b.getUser().getId().equals(caller.getId());
        boolean isAdmin = caller.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new AppException("You are not authorized to view this booking", HttpStatus.FORBIDDEN);
        }
        return b;
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException("Booking not found", HttpStatus.NOT_FOUND));
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new AppException("Unauthorized", HttpStatus.FORBIDDEN);
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new AppException("Booking is already cancelled", HttpStatus.BAD_REQUEST);
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        // Refund estimate (matches the 20% airline cancellation fee shown in the UI dialog).
        // Full refund policy engine arrives with the cancellation module.
        BigDecimal refund = booking.getTotalAmount().multiply(BigDecimal.valueOf(0.8));
        booking.setRefundAmount(refund);
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
                        .id(p.getId())
                        .firstName(p.getFirstName())
                        .lastName(p.getLastName())
                        .gender(p.getGender())
                        .age(p.getAge())
                        .nationality(p.getNationality())
                        .seatNumber(p.getSeatNumber())
                        .passportNumber(p.getPassportNumber())
                        .ticketNumber(p.getTicketNumber())
                        .type(p.getType() != null ? p.getType().name() : "ADULT")
                        .mealPreference(p.getMealPreference())
                        .seatPreference(p.getSeatPreference())
                        .specialAssistance(p.getSpecialAssistance())
                        .emergencyContactName(p.getEmergencyContactName())
                        .emergencyContactPhone(p.getEmergencyContactPhone())
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
                .contactEmail(b.getContactEmail())
                .contactPhone(b.getContactPhone())
                .cancellationReason(b.getCancellationReason())
                .refundAmount(b.getRefundAmount())
                .cancelledAt(b.getCancelledAt())
                .passengers(passengerResponses)
                .build();
    }

    /** Generates a unique ticket number per passenger, e.g. SK-4821590371. */
    private String generateTicketNumber() {
        return "SK-" + UUID.randomUUID().toString().replaceAll("[^0-9]", "").substring(0, 10);
    }
}
