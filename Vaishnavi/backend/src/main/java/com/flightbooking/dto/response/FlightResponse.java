package com.flightbooking.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
public class FlightResponse {
    private Long id;
    private String flightNumber;
    private String airlineCode;
    private String airlineName;
    private String airlineLogoUrl;
    private String originCode;
    private String originCity;
    private String originName;
    private String destinationCode;
    private String destinationCity;
    private String destinationName;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private int durationMinutes;
    private int stops;
    private BigDecimal basePrice;
    private int availableSeats;
    private String cabinClass;
    private String status;
}
