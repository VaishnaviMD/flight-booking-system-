package com.flightbooking.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "passengers")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Passenger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    private LocalDate dateOfBirth;

    private String passportNumber;

    private String seatNumber;

    @Enumerated(EnumType.STRING)
    private PassengerType type;

    // ---- Extended traveller details collected on the booking page ----
    @Column(length = 20)
    private String gender;

    private Integer age;

    @Column(length = 100)
    private String nationality;

    @Column(name = "meal_preference", length = 50)
    private String mealPreference;

    @Column(name = "seat_preference", length = 50)
    private String seatPreference;

    @Column(name = "special_assistance", length = 200)
    private String specialAssistance;

    @Column(name = "emergency_contact_name", length = 100)
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone", length = 20)
    private String emergencyContactPhone;

    @Column(name = "ticket_number", length = 30)
    private String ticketNumber;
}
