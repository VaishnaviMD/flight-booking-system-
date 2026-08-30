package com.flightbooking.service;

import com.flightbooking.dto.request.FlightSearchRequest;
import com.flightbooking.dto.response.FlightResponse;
import com.flightbooking.model.*;
import com.flightbooking.repository.FlightRepository;
import com.flightbooking.service.impl.FlightServiceImpl;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FlightServiceImplTest {

    @Mock
    private FlightRepository flightRepository;

    @InjectMocks
    private FlightServiceImpl flightService;

    @Test
    void searchFlightsShouldFilterAndReturnMatchingFlights() {
        Airport del = Airport.builder().code("DEL").city("New Delhi").name("Indira Gandhi").build();
        Airport bom = Airport.builder().code("BOM").city("Mumbai").name("Chhatrapati Shivaji").build();
        Airline airline = Airline.builder().code("6E").name("IndiGo").build();

        Flight flight = Flight.builder()
                .id(1L)
                .flightNumber("6E-101")
                .airline(airline)
                .origin(del)
                .destination(bom)
                .basePrice(BigDecimal.valueOf(4500))
                .availableSeats(20)
                .cabinClass(CabinClass.ECONOMY)
                .status(FlightStatus.SCHEDULED)
                .departureTime(LocalDateTime.now().plusDays(1))
                .arrivalTime(LocalDateTime.now().plusDays(1).plusHours(2))
                .stops(0)
                .durationMinutes(120)
                .build();

        when(flightRepository.searchFlights(eq("DEL"), eq("BOM"), any(LocalDateTime.class), any(LocalDateTime.class), eq(1)))
                .thenReturn(List.of(flight));

        FlightSearchRequest req = new FlightSearchRequest();
        req.setOrigin("DEL");
        req.setDestination("BOM");
        req.setDepartureDate(LocalDate.now().plusDays(1));
        req.setPassengers(1);

        List<FlightResponse> results = flightService.searchFlights(req);

        assertEquals(1, results.size());
        assertEquals("6E-101", results.get(0).getFlightNumber());
        assertEquals("DEL", results.get(0).getOriginCode());
        assertEquals("BOM", results.get(0).getDestinationCode());
        assertEquals("IndiGo", results.get(0).getAirlineName());
    }

    @Test
    void getByIdShouldReturnFlightWhenFound() {
        Airport del = Airport.builder().code("DEL").city("New Delhi").name("Indira Gandhi").build();
        Airport bom = Airport.builder().code("BOM").city("Mumbai").name("Chhatrapati Shivaji").build();
        Airline airline = Airline.builder().code("AI").name("Air India").build();

        Flight flight = Flight.builder()
                .id(10L)
                .flightNumber("AI-201")
                .airline(airline)
                .origin(del)
                .destination(bom)
                .basePrice(BigDecimal.valueOf(5500))
                .availableSeats(15)
                .cabinClass(CabinClass.BUSINESS)
                .status(FlightStatus.SCHEDULED)
                .departureTime(LocalDateTime.now().plusDays(2))
                .arrivalTime(LocalDateTime.now().plusDays(2).plusHours(2))
                .stops(0)
                .durationMinutes(120)
                .build();

        when(flightRepository.findById(10L)).thenReturn(Optional.of(flight));

        FlightResponse response = flightService.getById(10L);

        assertNotNull(response);
        assertEquals("AI-201", response.getFlightNumber());
        assertEquals("Air India", response.getAirlineName());
        assertEquals("DEL", response.getOriginCode());
        assertEquals("BOM", response.getDestinationCode());
    }
}
