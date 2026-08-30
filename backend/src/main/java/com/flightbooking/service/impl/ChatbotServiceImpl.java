package com.flightbooking.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.flightbooking.dto.request.ChatRequest;
import com.flightbooking.dto.response.ChatResponse;
import com.flightbooking.dto.response.FlightResponse;
import com.flightbooking.mcp.McpFlightToolService;
import com.flightbooking.repository.FlightRepository;
import com.flightbooking.service.ChatbotService;
import com.flightbooking.service.FlightService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotServiceImpl implements ChatbotService {

    @Value("${app.ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${app.ollama.model:llama3.2:1b}")
    private String configuredModel;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();
    private final FlightRepository flightRepository;
    private final FlightService flightService;
    private final McpFlightToolService mcpFlightToolService;

    private static final String SYSTEM_PROMPT = """
        You are SkyFlow AI Guide with MCP Tool capabilities for the SkyFlow Flight Booking System.

        RULES:
        1. ONLY assist with flights, airline policies, baggage allowances, bookings, cancellations, refunds, and airports.
        2. If the user asks about Train or Ship or Bus journeys, refuse immediately:
           "I am SkyFlow's Flight Booking Assistant and I only provide assistance for flights and air travel. I cannot assist with train, ship, or road journeys. How can I help you with your flight booking?"
        3. If the user asks about other non-flight topics (code, cooking, trivia, politics), refuse politely.
        4. Be concise, fast, and structured with bullet points.
        """;

    @Override
    public ChatResponse generateResponse(ChatRequest request) {
        String userMessage = request.getMessage().trim();
        String lower = userMessage.toLowerCase();

        // 1. MCP Check: Explicit Non-Flight Transport (Train, Ship, Cruise, Ferry, Bus, etc.)
        String transportRefusal = mcpFlightToolService.checkNonFlightTransportMode(userMessage);
        if (transportRefusal != null) {
            return ChatResponse.builder()
                    .reply(transportRefusal)
                    .model("SkyFlow-MCP-Guardrail")
                    .build();
        }

        // 2. MCP Check: General non-flight topics (code, cooking, math, jokes)
        if (isExplicitNonFlightTopic(userMessage)) {
            return ChatResponse.builder()
                    .reply("I am SkyFlow's Flight Booking AI Assistant. I can only assist with flight bookings, airline policies, baggage rules, ticket cancellations, and airport details.\n\nHow can I help you with your flight today?")
                    .model("SkyFlow-MCP-Guardrail")
                    .build();
        }

        // 3. Ultra-Fast MCP Tool Direct Dispatch for common intents (instant <15ms response)
        ChatResponse mcpFastResponse = evaluateMcpFastPath(userMessage, lower);
        if (mcpFastResponse != null) {
            return mcpFastResponse;
        }

        // 4. Ollama LLM execution with optimized high-speed parameters
        String activeModel = getAvailableOllamaModel();
        if (activeModel != null) {
            try {
                String aiReply = callOllamaOptimized(activeModel, request);
                if (aiReply != null && !aiReply.isBlank()) {
                    return ChatResponse.builder()
                            .reply(aiReply.trim())
                            .model("Ollama MCP (" + activeModel + ")")
                            .flightSuggestions(findRelevantFlights(userMessage))
                            .build();
                }
            } catch (Exception e) {
                log.warn("Ollama execution failed ({}), using MCP flight engine: {}", activeModel, e.getMessage());
            }
        }

        // 5. Fallback MCP Flight Engine
        String fallbackReply = generateFlightDomainFallback(userMessage);
        return ChatResponse.builder()
                .reply(fallbackReply)
                .model("SkyFlow-MCP-Engine")
                .flightSuggestions(findRelevantFlights(userMessage))
                .build();
    }

    /**
     * Instant MCP tool resolution for common queries (drastically cuts latency to <15ms).
     */
    private ChatResponse evaluateMcpFastPath(String userMessage, String lower) {
        // Baggage MCP Tool
        if (lower.contains("baggage") || lower.contains("luggage")) {
            Map<String, Object> toolRes = mcpFlightToolService.executeTool("get_baggage_allowance", Map.of());
            String text = "**SkyFlow Baggage Allowance (via MCP Tool):**\n\n" +
                    "• **Economy Class**: " + toolRes.get("economyCheckin") + " Check-in + " + toolRes.get("economyCabin") + " Cabin luggage\n" +
                    "• **Business Class**: " + toolRes.get("businessCheckin") + " Check-in + " + toolRes.get("businessCabin") + " Cabin luggage\n" +
                    "• **Infant Baggage**: " + toolRes.get("infantBaggage") + "\n\n" +
                    "Additional baggage can be booked during reservation or at the airport check-in counter.";
            return ChatResponse.builder().reply(text).model("SkyFlow-MCP (get_baggage_allowance)").build();
        }

        // Cancellation & Refund MCP Tool
        if (lower.contains("cancel") || lower.contains("refund")) {
            Map<String, Object> toolRes = mcpFlightToolService.executeTool("get_cancellation_policy", Map.of());
            String text = "**SkyFlow Cancellation & Refund Policy (via MCP Tool):**\n\n" +
                    "• **Free Cancellation**: " + toolRes.get("freeCancellationWindow") + " (" + toolRes.get("freeCancellationFee") + ")\n" +
                    "• **Late Cancellation**: " + toolRes.get("lateCancellationWindow") + " (" + toolRes.get("lateCancellationFee") + ")\n" +
                    "• **Refund Processing**: " + toolRes.get("refundTimeline") + "\n" +
                    "• **Refund Credit**: " + toolRes.get("refundMethod") + "\n\n" +
                    "You can cancel any booking anytime by navigating to **My Bookings** in the navigation bar.";
            return ChatResponse.builder().reply(text).model("SkyFlow-MCP (get_cancellation_policy)").build();
        }

        // Age calculation MCP Tool
        if (lower.contains("age") || lower.contains("dob") || lower.contains("date of birth") || lower.contains("passenger type")) {
            Map<String, Object> toolRes = mcpFlightToolService.executeTool("get_passenger_age_rules", Map.of());
            String text = "**SkyFlow Passenger Age Calculation (via MCP Tool):**\n\n" +
                    "• " + toolRes.get("autoCalculation") + "\n" +
                    "• **Infant (<2 yrs)**: " + toolRes.get("infant") + "\n" +
                    "• **Child (2–11 yrs)**: " + toolRes.get("child") + "\n" +
                    "• **Adult (12+ yrs)**: " + toolRes.get("adult") + "\n\n" +
                    "When booking, select the passenger's Date of Birth and the system will automatically compute the age and assign the correct passenger category.";
            return ChatResponse.builder().reply(text).model("SkyFlow-MCP (get_passenger_age_rules)").build();
        }

        // Specific Flight Search MCP Tool (e.g. DEL to BOM)
        String[] route = detectOriginDestination(userMessage);
        if (route != null && (lower.contains("flight") || lower.contains("schedule") || lower.contains("available") || lower.contains("book"))) {
            Map<String, Object> toolRes = mcpFlightToolService.executeTool("search_flights", Map.of(
                    "origin", route[0],
                    "destination", route[1]
            ));
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> flights = (List<Map<String, Object>>) toolRes.getOrDefault("flights", List.of());
            if (!flights.isEmpty()) {
                StringBuilder sb = new StringBuilder();
                sb.append("**Available Flights from ").append(route[0]).append(" to ").append(route[1]).append(" (via MCP Tool):**\n\n");
                for (Map<String, Object> f : flights) {
                    sb.append("• ✈️ **").append(f.get("airline")).append("** (").append(f.get("flightNumber")).append(")\n")
                      .append("   - Route: ").append(f.get("origin")).append(" ➔ ").append(f.get("destination")).append("\n")
                      .append("   - Fare: **₹").append(f.get("price")).append("** · ").append(f.get("availableSeats")).append(" seats available\n\n");
                }
                sb.append("You can book any of these flights directly from the search tab or use the flight card below!");
                return ChatResponse.builder()
                        .reply(sb.toString())
                        .model("SkyFlow-MCP (search_flights)")
                        .flightSuggestions(findRelevantFlights(userMessage))
                        .build();
            }
        }

        return null;
    }

    private String[] detectOriginDestination(String message) {
        String q = message.toUpperCase();
        String origin = null;
        String dest = null;

        if (q.contains("DELHI") || q.contains("DEL")) origin = "DEL";
        if (q.contains("MUMBAI") || q.contains("BOM")) {
            if (origin == null) origin = "BOM"; else dest = "BOM";
        }
        if (q.contains("BANGALORE") || q.contains("BENGALURU") || q.contains("BLR")) {
            if (origin == null) origin = "BLR"; else dest = "BLR";
        }
        if (q.contains("CHENNAI") || q.contains("MAA")) {
            if (origin == null) origin = "MAA"; else dest = "MAA";
        }
        if (q.contains("HYDERABAD") || q.contains("HYD")) {
            if (origin == null) origin = "HYD"; else dest = "HYD";
        }
        if (q.contains("KOLKATA") || q.contains("CCU")) {
            if (origin == null) origin = "CCU"; else dest = "CCU";
        }
        if (q.contains("GOA") || q.contains("GOI")) {
            if (origin == null) origin = "GOI"; else dest = "GOI";
        }

        if (origin != null && dest != null && !origin.equals(dest)) {
            return new String[]{ origin, dest };
        }
        return null;
    }

    private boolean isExplicitNonFlightTopic(String message) {
        String q = message.toLowerCase();
        // Allow general greetings and flight terms
        if (q.equals("hi") || q.equals("hello") || q.equals("hey") || q.contains("flight") ||
            q.contains("airline") || q.contains("airport") || q.contains("ticket") ||
            q.contains("booking") || q.contains("baggage") || q.contains("pnr") ||
            q.contains("cancel") || q.contains("refund") || q.contains("seat") ||
            q.contains("plane") || q.contains("fare") || q.contains("skyflow")) {
            return false;
        }

        String[] nonFlightTriggers = {
            "recipe", "cake", "cook", "food", "bake",
            "write code", "python", "javascript", "java program", "sql query", "function",
            "math", "calculate 2+", "solve equation",
            "who is president", "who won the match", "cricket score", "football",
            "tell me a joke", "write an essay", "movie", "song", "lyrics",
            "weather in new york", "stock price", "crypto", "bitcoin"
        };

        for (String trigger : nonFlightTriggers) {
            if (q.contains(trigger)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Optimized Ollama API call with thread pinning, token prediction limit, and low temperature for fast inference.
     */
    private String callOllamaOptimized(String modelName, ChatRequest request) throws Exception {
        String url = ollamaBaseUrl + "/api/chat";

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("model", modelName);
        payload.put("stream", false);

        // Optimized fast inference options
        ObjectNode options = payload.putObject("options");
        options.put("num_thread", 8);        // Use full CPU threads
        options.put("num_predict", 180);      // Keep responses concise and fast (<2s)
        options.put("temperature", 0.2);     // Focused deterministic flight answers
        options.put("top_k", 20);
        options.put("top_p", 0.85);
        options.put("num_ctx", 1024);        // Lightweight context window for fast prefill

        ArrayNode messagesNode = payload.putArray("messages");

        // 1. System instruction
        ObjectNode sysMsg = messagesNode.addObject();
        sysMsg.put("role", "system");
        sysMsg.put("content", SYSTEM_PROMPT);

        // 2. Chat history (last 4 turns for speed)
        if (request.getHistory() != null && !request.getHistory().isEmpty()) {
            int startIdx = Math.max(0, request.getHistory().size() - 4);
            for (int i = startIdx; i < request.getHistory().size(); i++) {
                ChatRequest.MessageItem item = request.getHistory().get(i);
                if (item.getContent() != null && !item.getContent().isBlank()) {
                    ObjectNode histNode = messagesNode.addObject();
                    histNode.put("role", item.getRole().equalsIgnoreCase("user") ? "user" : "assistant");
                    histNode.put("content", item.getContent());
                }
            }
        }

        // 3. User message
        ObjectNode userMsg = messagesNode.addObject();
        userMsg.put("role", "user");
        userMsg.put("content", request.getMessage());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> httpEntity = new HttpEntity<>(payload.toString(), headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, httpEntity, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            if (root.has("message") && root.get("message").has("content")) {
                return root.get("message").get("content").asText();
            }
        }

        return null;
    }

    private String getAvailableOllamaModel() {
        try {
            String tagsUrl = ollamaBaseUrl + "/api/tags";
            ResponseEntity<String> response = restTemplate.getForEntity(tagsUrl, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                if (root.has("models") && root.get("models").isArray()) {
                    ArrayNode models = (ArrayNode) root.get("models");
                    if (models.size() > 0) {
                        for (JsonNode m : models) {
                            String name = m.get("name").asText();
                            if (name.startsWith(configuredModel) || configuredModel.startsWith(name)) {
                                return name;
                            }
                        }
                        return models.get(0).get("name").asText();
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Ollama server check on {} returned: {}", ollamaBaseUrl, e.getMessage());
        }
        return null;
    }

    private String generateFlightDomainFallback(String query) {
        String q = query.toLowerCase();

        if (q.contains("baggage") || q.contains("luggage")) {
            return "**SkyFlow Baggage Allowance Rules:**\n\n" +
                   "• **Economy Class**: 15 Kg Check-in baggage + 7 Kg Cabin/Hand luggage per passenger.\n" +
                   "• **Business Class**: 25 Kg Check-in baggage + 7 Kg Cabin/Hand luggage per passenger.\n\n" +
                   "Additional baggage can be purchased at airline check-in counters prior to departure.";
        }

        if (q.contains("cancel") || q.contains("refund")) {
            return "**SkyFlow Ticket Cancellation & Refund Policy:**\n\n" +
                   "• **Free Cancellation**: Cancel up to 24 hours prior to flight departure for a 100% full refund.\n" +
                   "• **Within 24 Hours**: Cancellations made within 24 hours of flight departure incur a standard 20% airline cancellation fee (80% refund).\n" +
                   "• **Refund Processing**: Refund amounts are automatically credited to your original payment method in 3 to 5 business days.";
        }

        return "Hello! I am your SkyFlow AI Flight Guide with MCP Tool support. I can assist with:\n\n" +
               "• ✈️ **Real-Time Flight Search & Schedules** (DEL, BOM, BLR, MAA, HYD, etc.)\n" +
               "• 🧳 **Baggage Allowance Policy** (15 Kg Economy / 25 Kg Business)\n" +
               "• 🔄 **Cancellations & Refund Inquiries**\n" +
               "• 🎫 **Passenger Age & Ticket Info**\n\n" +
               "What flight or destination can I assist you with today?";
    }

    private List<FlightResponse> findRelevantFlights(String query) {
        try {
            String[] route = detectOriginDestination(query);
            if (route != null) {
                final String o = route[0];
                final String d = route[1];
                return flightRepository.findAll().stream()
                        .filter(f -> f.getOrigin() != null && f.getDestination() != null &&
                                o.equalsIgnoreCase(f.getOrigin().getCode()) && d.equalsIgnoreCase(f.getDestination().getCode()))
                        .limit(2)
                        .map(flightService::toResponse)
                        .collect(Collectors.toList());
            }
        } catch (Exception ignored) {}
        return Collections.emptyList();
    }
}
