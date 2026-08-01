package com.flightbooking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class BookingRequest {
    @NotNull private Long flightId;
    private Long returnFlightId;

    @NotBlank private String cabinClass;

    @Min(1)
    private Integer passengerCount;

    @NotNull private List<PassengerRequest> passengers;

    @Data
    public static class PassengerRequest {
        @NotBlank private String firstName;
        @NotBlank private String lastName;
        private LocalDate dateOfBirth;
        private String passportNumber;
        private String seatNumber;
        private String type;
    }
}
