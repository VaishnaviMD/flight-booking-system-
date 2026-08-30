package com.flightbooking.service;

import com.flightbooking.dto.request.ChatRequest;
import com.flightbooking.dto.response.ChatResponse;
import com.flightbooking.mcp.McpFlightToolService;
import com.flightbooking.repository.AirlineRepository;
import com.flightbooking.repository.AirportRepository;
import com.flightbooking.repository.FlightRepository;
import com.flightbooking.service.impl.ChatbotServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ChatbotServiceImplTest {

    @Mock
    private FlightRepository flightRepository;

    @Mock
    private AirportRepository airportRepository;

    @Mock
    private AirlineRepository airlineRepository;

    @Mock
    private FlightService flightService;

    private McpFlightToolService mcpFlightToolService;
    private ChatbotServiceImpl chatbotService;

    @BeforeEach
    void setUp() {
        mcpFlightToolService = new McpFlightToolService(flightRepository, airportRepository, airlineRepository);
        chatbotService = new ChatbotServiceImpl(flightRepository, flightService, mcpFlightToolService);
        ReflectionTestUtils.setField(chatbotService, "ollamaBaseUrl", "http://localhost:11434");
        ReflectionTestUtils.setField(chatbotService, "configuredModel", "llama3.2:1b");
    }

    @Test
    void shouldRefuseTrainTransportQueryImmediately() {
        ChatRequest request = ChatRequest.builder()
                .message("Can I book a train ticket from Delhi to Mumbai?")
                .build();

        ChatResponse response = chatbotService.generateResponse(request);

        assertNotNull(response);
        assertTrue(response.getReply().contains("train or railway journeys"));
        assertEquals("SkyFlow-MCP-Guardrail", response.getModel());
    }

    @Test
    void shouldRefuseShipTransportQueryImmediately() {
        ChatRequest request = ChatRequest.builder()
                .message("Are there cruise ships to Goa?")
                .build();

        ChatResponse response = chatbotService.generateResponse(request);

        assertNotNull(response);
        assertTrue(response.getReply().contains("ship, cruise, or sea journeys"));
        assertEquals("SkyFlow-MCP-Guardrail", response.getModel());
    }

    @Test
    void shouldRefuseNonFlightTopicImmediately() {
        ChatRequest request = ChatRequest.builder()
                .message("Can you give me a recipe for chocolate cake?")
                .build();

        ChatResponse response = chatbotService.generateResponse(request);

        assertNotNull(response);
        assertTrue(response.getReply().contains("SkyFlow's Flight Booking AI Assistant"));
        assertEquals("SkyFlow-MCP-Guardrail", response.getModel());
    }

    @Test
    void shouldDispatchMcpBaggageToolInstantly() {
        ChatRequest request = ChatRequest.builder()
                .message("What are the baggage allowance rules for economy and business?")
                .build();

        ChatResponse response = chatbotService.generateResponse(request);

        assertNotNull(response);
        assertTrue(response.getReply().contains("15 Kg"));
        assertTrue(response.getReply().contains("25 Kg"));
        assertEquals("SkyFlow-MCP (get_baggage_allowance)", response.getModel());
    }

    @Test
    void shouldDispatchMcpCancellationToolInstantly() {
        ChatRequest request = ChatRequest.builder()
                .message("How can I cancel my flight booking and get a refund?")
                .build();

        ChatResponse response = chatbotService.generateResponse(request);

        assertNotNull(response);
        assertTrue(response.getReply().contains("Free Cancellation"));
        assertTrue(response.getReply().contains("3 to 5 business days"));
        assertEquals("SkyFlow-MCP (get_cancellation_policy)", response.getModel());
    }
}
