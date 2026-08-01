package com.flightbooking.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class BookingResponse {
    private Long id;
    private String pnr;
    private String status;
    private FlightResponse flight;
    private FlightResponse returnFlight;
    private String cabinClass;
    private BigDecimal totalAmount;
    private BigDecimal totalPrice;
    private LocalDateTime bookedAt;
    private String createdAt;
    private List<PassengerResponse> passengers;

    @Data @Builder
    public static class PassengerResponse {
        private Long id;
        private String firstName;
        private String lastName;
        private String gender;
        private Integer age;
        private String seatNumber;
        private String passportNumber;
        private String ticketNumber;
        private String type;
    }
}
