package com.flightbooking.mcp;

import com.flightbooking.model.Airport;
import com.flightbooking.model.Flight;
import com.flightbooking.repository.AirlineRepository;
import com.flightbooking.repository.AirportRepository;
import com.flightbooking.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class McpFlightToolService {

    private final FlightRepository flightRepository;
    private final AirportRepository airportRepository;
    private final AirlineRepository airlineRepository;

    public List<McpTool> listTools() {
        List<McpTool> tools = new ArrayList<>();

        tools.add(McpTool.builder()
                .name("search_flights")
                .description("Search active and scheduled flights between origin and destination airport codes (e.g. DEL to BOM).")
                .inputSchema(Map.of(
                        "type", "object",
                        "properties", Map.of(
                                "origin", Map.of("type", "string", "description", "Origin airport 3-letter IATA code, e.g. DEL, BOM, BLR"),
                                "destination", Map.of("type", "string", "description", "Destination airport 3-letter IATA code, e.g. BOM, BLR, MAA")
                        ),
                        "required", List.of("origin", "destination")
                ))
                .build());

        tools.add(McpTool.builder()
                .name("get_baggage_allowance")
                .description("Retrieve the official baggage policy and allowances for Economy and Business class.")
                .inputSchema(Map.of("type", "object", "properties", Map.of()))
                .build());

        tools.add(McpTool.builder()
                .name("get_cancellation_policy")
                .description("Retrieve official flight cancellation timelines, cancellation fee percentages, and refund processing details.")
                .inputSchema(Map.of("type", "object", "properties", Map.of()))
                .build());

        tools.add(McpTool.builder()
                .name("get_airports_list")
                .description("Retrieve all operational airports and hub locations supported in SkyFlow.")
                .inputSchema(Map.of("type", "object", "properties", Map.of()))
                .build());

        tools.add(McpTool.builder()
                .name("get_passenger_age_rules")
                .description("Retrieve passenger age calculation rules based on Date of Birth and passenger category definitions.")
                .inputSchema(Map.of("type", "object", "properties", Map.of()))
                .build());

        return tools;
    }

    public Map<String, Object> executeTool(String toolName, Map<String, Object> arguments) {
        log.info("Executing MCP tool: {} with args: {}", toolName, arguments);
        Map<String, Object> result = new HashMap<>();

        switch (toolName) {
            case "search_flights" -> {
                String origin = arguments.getOrDefault("origin", "").toString().toUpperCase();
                String destination = arguments.getOrDefault("destination", "").toString().toUpperCase();

                List<Flight> flights = flightRepository.findAll().stream()
                        .filter(f -> f.getOrigin() != null && f.getDestination() != null)
                        .filter(f -> origin.isBlank() || f.getOrigin().getCode().equalsIgnoreCase(origin))
                        .filter(f -> destination.isBlank() || f.getDestination().getCode().equalsIgnoreCase(destination))
                        .limit(5)
                        .toList();

                List<Map<String, Object>> flightList = flights.stream().map(f -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("flightNumber", f.getFlightNumber());
                    map.put("airline", f.getAirline() != null ? f.getAirline().getName() : "SkyFlow Partner");
                    map.put("origin", f.getOrigin().getCity() + " (" + f.getOrigin().getCode() + ")");
                    map.put("destination", f.getDestination().getCity() + " (" + f.getDestination().getCode() + ")");
                    map.put("departureTime", f.getDepartureTime().toString());
                    map.put("arrivalTime", f.getArrivalTime().toString());
                    map.put("price", f.getBasePrice());
                    map.put("availableSeats", f.getAvailableSeats());
                    map.put("cabinClass", f.getCabinClass().toString());
                    return map;
                }).collect(Collectors.toList());

                result.put("flightsCount", flightList.size());
                result.put("flights", flightList);
            }

            case "get_baggage_allowance" -> {
                result.put("economyCheckin", "15 Kg");
                result.put("economyCabin", "7 Kg");
                result.put("businessCheckin", "25 Kg");
                result.put("businessCabin", "7 Kg");
                result.put("infantBaggage", "7 Kg cabin bag + 1 collapsible stroller allowed free of charge");
                result.put("excessBaggage", "Can be purchased at airport check-in counter at standard airline rates");
            }

            case "get_cancellation_policy" -> {
                result.put("freeCancellationWindow", "Up to 24 hours prior to departure");
                result.put("freeCancellationFee", "₹0 (100% full refund)");
                result.put("lateCancellationWindow", "Within 24 hours of flight departure");
                result.put("lateCancellationFee", "20% airline administrative fee (80% refund)");
                result.put("refundTimeline", "3 to 5 business days");
                result.put("refundMethod", "Automatically credited back to the original payment method");
            }

            case "get_airports_list" -> {
                List<Airport> airports = airportRepository.findAll();
                List<Map<String, String>> list = airports.stream().map(a -> Map.of(
                        "code", a.getCode(),
                        "city", a.getCity(),
                        "name", a.getName(),
                        "country", a.getCountry()
                )).collect(Collectors.toList());
                result.put("airports", list);
            }

            case "get_passenger_age_rules" -> {
                result.put("autoCalculation", "Age is automatically calculated in years based on the entered Date of Birth (DOB).");
                result.put("infant", "Under 2 years old (Infant)");
                result.put("child", "2 to 11 years old (Child)");
                result.put("adult", "12 years and older (Adult)");
            }

            default -> result.put("error", "Unknown MCP tool: " + toolName);
        }

        return result;
    }

    /**
     * Checks if the user is asking about non-flight travel modes (train, ship, bus, etc.)
     */
    public String checkNonFlightTransportMode(String query) {
        String q = query.toLowerCase();

        // Train journey triggers
        if (q.contains("train") || q.contains("railway") || q.contains("irctc") ||
            q.contains("vande bharat") || q.contains("rajdhani") || q.contains("shatabdi") ||
            q.contains("platform") || q.contains("rail ticket") || q.contains("sleeper class") ||
            q.contains("tatkal")) {
            return "I am SkyFlow's Flight Booking Assistant and I only provide assistance for flights and air travel. I do not provide information regarding train or railway journeys.\n\nPlease let me know how I can assist with your flight booking!";
        }

        // Ship / Cruise / Ferry triggers
        if (q.contains("ship") || q.contains("cruise") || q.contains("ferry") ||
            q.contains("boat") || q.contains("ocean journey") || q.contains("sailing") ||
            q.contains("port") || q.contains("vessel") || q.contains("cargo ship") ||
            q.contains("yacht")) {
            return "I am SkyFlow's Flight Booking Assistant and I only provide assistance for flights and air travel. I do not provide information regarding ship, cruise, or sea journeys.\n\nPlease let me know how I can assist with your flight booking!";
        }

        // Bus / Road / Cab triggers
        if (q.contains("bus ticket") || q.contains("sleeper bus") || q.contains("volvo bus") ||
            q.contains("road trip") || q.contains("cab booking") || q.contains("taxi fare") ||
            q.contains("metro station") || q.contains("metro train")) {
            return "I am SkyFlow's Flight Booking Assistant and I only provide assistance for flights and air travel. I do not provide information regarding bus, road, or cab transport.\n\nPlease let me know how I can assist with your flight booking!";
        }

        return null;
    }
}
