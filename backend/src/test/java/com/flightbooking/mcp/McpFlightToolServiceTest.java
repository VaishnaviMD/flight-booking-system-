package com.flightbooking.mcp;

import com.flightbooking.model.Airport;
import com.flightbooking.model.CabinClass;
import com.flightbooking.model.Flight;
import com.flightbooking.model.FlightStatus;
import com.flightbooking.repository.AirlineRepository;
import com.flightbooking.repository.AirportRepository;
import com.flightbooking.repository.FlightRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class McpFlightToolServiceTest {

    @Mock
    private FlightRepository flightRepository;

    @Mock
    private AirportRepository airportRepository;

    @Mock
    private AirlineRepository airlineRepository;

    @InjectMocks
    private McpFlightToolService mcpToolService;

    @Test
    void listToolsShouldReturnAllFiveTools() {
        List<McpTool> tools = mcpToolService.listTools();

        assertEquals(5, tools.size());
        assertTrue(tools.stream().anyMatch(t -> t.getName().equals("search_flights")));
        assertTrue(tools.stream().anyMatch(t -> t.getName().equals("get_baggage_allowance")));
        assertTrue(tools.stream().anyMatch(t -> t.getName().equals("get_cancellation_policy")));
        assertTrue(tools.stream().anyMatch(t -> t.getName().equals("get_airports_list")));
        assertTrue(tools.stream().anyMatch(t -> t.getName().equals("get_passenger_age_rules")));
    }

    @Test
    void executeBaggageToolShouldReturnAllowances() {
        Map<String, Object> result = mcpToolService.executeTool("get_baggage_allowance", Map.of());

        assertEquals("15 Kg", result.get("economyCheckin"));
        assertEquals("7 Kg", result.get("economyCabin"));
        assertEquals("25 Kg", result.get("businessCheckin"));
        assertEquals("7 Kg", result.get("businessCabin"));
    }

    @Test
    void executeCancellationToolShouldReturnPolicy() {
        Map<String, Object> result = mcpToolService.executeTool("get_cancellation_policy", Map.of());

        assertNotNull(result.get("freeCancellationWindow"));
        assertNotNull(result.get("lateCancellationFee"));
        assertEquals("3 to 5 business days", result.get("refundTimeline"));
    }

    @Test
    void executeSearchFlightsToolShouldReturnMatchingFlights() {
        Airport del = Airport.builder().code("DEL").city("New Delhi").name("Indira Gandhi").build();
        Airport bom = Airport.builder().code("BOM").city("Mumbai").name("Chhatrapati Shivaji").build();

        Flight flight = Flight.builder()
                .id(1L)
                .flightNumber("6E-101")
                .origin(del)
                .destination(bom)
                .basePrice(BigDecimal.valueOf(4500))
                .availableSeats(20)
                .cabinClass(CabinClass.ECONOMY)
                .status(FlightStatus.SCHEDULED)
                .departureTime(LocalDateTime.now().plusDays(1))
                .arrivalTime(LocalDateTime.now().plusDays(1).plusHours(2))
                .build();

        when(flightRepository.findAll()).thenReturn(List.of(flight));

        Map<String, Object> result = mcpToolService.executeTool("search_flights", Map.of(
                "origin", "DEL",
                "destination", "BOM"
        ));

        assertEquals(1, result.get("flightsCount"));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> list = (List<Map<String, Object>>) result.get("flights");
        assertEquals("6E-101", list.get(0).get("flightNumber"));
    }

    @Test
    void checkNonFlightTransportModeShouldIdentifyTrainAndShipQueries() {
        String trainRefusal = mcpToolService.checkNonFlightTransportMode("Can I book a train ticket from Delhi to Mumbai?");
        assertNotNull(trainRefusal);
        assertTrue(trainRefusal.contains("train or railway journeys"));

        String shipRefusal = mcpToolService.checkNonFlightTransportMode("Are there cruise ships to Goa?");
        assertNotNull(shipRefusal);
        assertTrue(shipRefusal.contains("ship, cruise, or sea journeys"));

        String flightQuery = mcpToolService.checkNonFlightTransportMode("Are there flights to Mumbai?");
        assertNull(flightQuery);
    }
}
