package com.flightbooking.service;

import com.flightbooking.dto.request.ChatRequest;
import com.flightbooking.dto.response.ChatResponse;

public interface ChatbotService {
    ChatResponse generateResponse(ChatRequest request);
}
