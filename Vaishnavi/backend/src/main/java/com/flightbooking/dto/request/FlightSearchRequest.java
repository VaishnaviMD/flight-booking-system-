package com.flightbooking.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class FlightSearchRequest {
    private String origin;
    private String destination;
    private LocalDate departureDate;
    private LocalDate returnDate;
    private int passengers = 1;
    private String cabinClass = "ECONOMY";
    private String tripType = "ONE_WAY";

    // Filters
    private Double minPrice;
    private Double maxPrice;
    private Integer maxStops;
    private String airlineCode;
    private String sortBy = "price";
    private String sortDir = "asc";
}
