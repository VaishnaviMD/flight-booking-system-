package com.flightbooking.service;

import com.flightbooking.dto.request.BookingRequest;
import com.flightbooking.dto.response.BookingResponse;
import com.flightbooking.model.*;
import com.flightbooking.repository.BookingRepository;
import com.flightbooking.repository.FlightRepository;
import com.flightbooking.repository.UserRepository;
import com.flightbooking.service.FlightService;
import com.flightbooking.service.impl.BookingServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private FlightRepository flightRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FlightService flightService;

    @InjectMocks
    private BookingServiceImpl bookingService;

    @Test
    void createBookingShouldDerivePassengerCountFromPassengersList() {
        User user = User.builder().id(1L).email("user@example.com").firstName("Test").lastName("User").role(Role.USER).build();
        Flight flight = Flight.builder()
                .id(10L)
                .flightNumber("AI-101")
                .basePrice(BigDecimal.valueOf(4500))
                .availableSeats(10)
                .cabinClass(CabinClass.ECONOMY)
                .status(FlightStatus.SCHEDULED)
                .build();

        BookingRequest request = new BookingRequest();
        request.setFlightId(10L);
        request.setCabinClass("ECONOMY");
        request.setPassengers(List.of(
                passenger("John", "Doe"),
                passenger("Jane", "Doe")
        ));

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(flightRepository.findById(10L)).thenReturn(Optional.of(flight));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking saved = invocation.getArgument(0);
            saved.setId(100L);
            saved.setBookedAt(LocalDateTime.now());
            return saved;
        });
        when(flightRepository.save(any(Flight.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(flightService.toResponse(any(Flight.class))).thenReturn(
                com.flightbooking.dto.response.FlightResponse.builder()
                        .id(10L)
                        .flightNumber("AI-101")
                        .airlineCode("AI")
                        .airlineName("Air India")
                        .airlineLogoUrl("https://example.com/logo.png")
                        .originCode("DEL")
                        .originCity("Delhi")
                        .originName("Indira Gandhi Intl")
                        .destinationCode("BOM")
                        .destinationCity("Mumbai")
                        .destinationName("Chhatrapati Shivaji Intl")
                        .departureTime(LocalDateTime.now().plusHours(2))
                        .arrivalTime(LocalDateTime.now().plusHours(4))
                        .durationMinutes(120)
                        .stops(0)
                        .basePrice(BigDecimal.valueOf(4500))
                        .availableSeats(10)
                        .cabinClass("ECONOMY")
                        .status("SCHEDULED")
                        .build()
        );

        BookingResponse response = bookingService.createBooking(request, "user@example.com");

        assertEquals(2, response.getPassengers().size());
        assertEquals(8, flight.getAvailableSeats());
    }

    private BookingRequest.PassengerRequest passenger(String firstName, String lastName) {
        BookingRequest.PassengerRequest passenger = new BookingRequest.PassengerRequest();
        passenger.setFirstName(firstName);
        passenger.setLastName(lastName);
        passenger.setDateOfBirth(LocalDate.of(1990, 1, 1));
        passenger.setPassportNumber("P123456");
        passenger.setType("ADULT");
        return passenger;
    }
}
