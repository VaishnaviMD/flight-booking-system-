package com.flightbooking.controller;

import com.flightbooking.mcp.McpFlightToolService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ChatGptActionController {

    private final McpFlightToolService mcpFlightToolService;

    @GetMapping("/api/chatgpt/flights/search")
    public ResponseEntity<Map<String, Object>> searchFlights(
            @RequestParam(required = false, defaultValue = "DEL") String origin,
            @RequestParam(required = false, defaultValue = "BOM") String destination) {

        Map<String, Object> result = mcpFlightToolService.executeTool("search_flights", Map.of(
                "origin", origin.toUpperCase().trim(),
                "destination", destination.toUpperCase().trim()
        ));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/api/chatgpt/policy/baggage")
    public ResponseEntity<Map<String, Object>> getBaggagePolicy() {
        return ResponseEntity.ok(mcpFlightToolService.executeTool("get_baggage_allowance", Map.of()));
    }

    @GetMapping("/api/chatgpt/policy/cancellation")
    public ResponseEntity<Map<String, Object>> getCancellationPolicy() {
        return ResponseEntity.ok(mcpFlightToolService.executeTool("get_cancellation_policy", Map.of()));
    }

    @GetMapping("/api/chatgpt/airports")
    public ResponseEntity<Map<String, Object>> getAirports() {
        return ResponseEntity.ok(mcpFlightToolService.executeTool("get_airports_list", Map.of()));
    }

    @GetMapping("/api/chatgpt/rules/passenger")
    public ResponseEntity<Map<String, Object>> getPassengerRules() {
        return ResponseEntity.ok(mcpFlightToolService.executeTool("get_passenger_age_rules", Map.of()));
    }

    @GetMapping(value = "/.well-known/ai-plugin.json", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getAiPluginManifest() {
        Map<String, Object> manifest = new HashMap<>();
        manifest.put("schema_version", "v1");
        manifest.put("name_for_human", "SkyFlow Flight Assistant");
        manifest.put("name_for_model", "skyflow_flight_assistant");
        manifest.put("description_for_human", "Search live flights, check baggage policies, cancellation rules, and airport schedules on SkyFlow.");
        manifest.put("description_for_model", "Plugin and action tool provider for querying live flights, airline schedules, baggage allowances, cancellation fees, and airport codes from SkyFlow Flight Booking System. Note: Only flight and air travel queries are supported.");
        manifest.put("auth", Map.of("type", "none"));
        manifest.put("api", Map.of(
                "type", "openapi",
                "url", "/api/chatgpt/openapi.json"
        ));
        manifest.put("logo_url", "https://raw.githubusercontent.com/VaishnaviMD/flight-booking-system-/master/frontend/src/favicon.ico");
        manifest.put("contact_email", "support@skyflow.com");
        manifest.put("legal_info_url", "https://skyflow.com/terms");

        return ResponseEntity.ok(manifest);
    }

    @GetMapping(value = "/api/chatgpt/openapi.json", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getOpenApiSchema() {
        Map<String, Object> doc = new HashMap<>();
        doc.put("openapi", "3.1.0");
        doc.put("info", Map.of(
                "title", "SkyFlow Flight Booking Assistant API",
                "description", "Live flight search, baggage policies, cancellation rules, and airport information API for ChatGPT Custom Actions and Plugins.",
                "version", "1.0.0"
        ));

        // Note: Replace with public HTTPS URL (e.g. ngrok) when testing in ChatGPT cloud
        doc.put("servers", List.of(
                Map.of("url", "http://localhost:8080", "description", "Local Development Server"),
                Map.of("url", "https://your-public-ngrok-domain.ngrok-free.app", "description", "Live ChatGPT Action Tunnel")
        ));

        Map<String, Object> paths = new HashMap<>();

        // /api/chatgpt/flights/search
        paths.put("/api/chatgpt/flights/search", Map.of(
                "get", Map.of(
                        "operationId", "searchFlights",
                        "summary", "Search available scheduled flights between origin and destination airports",
                        "parameters", List.of(
                                Map.of("name", "origin", "in", "query", "required", true, "schema", Map.of("type", "string", "example", "DEL"), "description", "3-letter IATA origin airport code (e.g. DEL, BOM, BLR, MAA, HYD, CCU, GOI)"),
                                Map.of("name", "destination", "in", "query", "required", true, "schema", Map.of("type", "string", "example", "BOM"), "description", "3-letter IATA destination airport code (e.g. BOM, BLR, DEL, MAA, HYD, CCU, GOI)")
                        ),
                        "responses", Map.of(
                                "200", Map.of("description", "List of matching flights with prices and available seats")
                        )
                )
        ));

        // /api/chatgpt/policy/baggage
        paths.put("/api/chatgpt/policy/baggage", Map.of(
                "get", Map.of(
                        "operationId", "getBaggagePolicy",
                        "summary", "Get official check-in and cabin baggage allowances for Economy and Business class",
                        "responses", Map.of(
                                "200", Map.of("description", "Baggage weight limits for cabin and check-in luggage")
                        )
                )
        ));

        // /api/chatgpt/policy/cancellation
        paths.put("/api/chatgpt/policy/cancellation", Map.of(
                "get", Map.of(
                        "operationId", "getCancellationPolicy",
                        "summary", "Get flight cancellation fees, windows, and refund processing timelines",
                        "responses", Map.of(
                                "200", Map.of("description", "Cancellation terms, fees (0% before 24h, 20% within 24h), and refund processing duration")
                        )
                )
        ));

        // /api/chatgpt/airports
        paths.put("/api/chatgpt/airports", Map.of(
                "get", Map.of(
                        "operationId", "getAirportsList",
                        "summary", "Get all operational metro airports and hub locations supported in SkyFlow",
                        "responses", Map.of(
                                "200", Map.of("description", "List of supported Indian airport hubs and IATA codes")
                        )
                )
        ));

        // /api/chatgpt/rules/passenger
        paths.put("/api/chatgpt/rules/passenger", Map.of(
                "get", Map.of(
                        "operationId", "getPassengerRules",
                        "summary", "Get rules for automated age calculation from Date of Birth and passenger types",
                        "responses", Map.of(
                                "200", Map.of("description", "Passenger age categories (Infant <2, Child 2-11, Adult 12+)")
                        )
                )
        ));

        doc.put("paths", paths);
        return ResponseEntity.ok(doc);
    }
}
