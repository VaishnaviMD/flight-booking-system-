package com.flightbooking.dto.request;

import jakarta.validation.constraints.Email;
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

    @NotBlank(message = "Contact email is required")
    @Email(message = "Contact email must be valid")
    private String contactEmail;

    private String contactPhone;

    @NotNull private List<PassengerRequest> passengers;

    @Data
    public static class PassengerRequest {
        @NotBlank private String firstName;
        @NotBlank private String lastName;
        private LocalDate dateOfBirth;
        private Integer age;
        private String gender;
        private String nationality;
        private String passportNumber;
        private String mealPreference;
        private String seatPreference;
        private String specialAssistance;
        private String emergencyContactName;
        private String emergencyContactPhone;
        private String seatNumber;
        private String type;
    }
}
