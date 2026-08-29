package com.flightbooking.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "flights")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Flight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String flightNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "airline_code", nullable = false)
    private Airline airline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origin_code", nullable = false)
    private Airport origin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_code", nullable = false)
    private Airport destination;

    @Column(nullable = false)
    private LocalDateTime departureTime;

    @Column(nullable = false)
    private LocalDateTime arrivalTime;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(nullable = false)
    private Integer totalSeats;

    @Column(nullable = false)
    private Integer availableSeats;

    @Column(nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false)
    private Integer stops;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CabinClass cabinClass;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FlightStatus status;

    // ---- Flight metadata shown on the details page ----
    @Column(name = "aircraft_type", length = 100)
    private String aircraftType;

    @Column(name = "baggage_checkin", length = 100)
    private String baggageCheckin;

    @Column(name = "baggage_cabin", length = 100)
    private String baggageCabin;

    @Column(name = "meal_included")
    private Boolean mealIncluded;

    @Column(name = "refundable")
    private Boolean refundable;

    @Column(name = "fare_rules", length = 1000)
    private String fareRules;
}
