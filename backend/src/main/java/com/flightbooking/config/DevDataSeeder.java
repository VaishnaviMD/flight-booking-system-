package com.flightbooking.config;

import com.flightbooking.model.*;
import com.flightbooking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
@Profile("dev")
@RequiredArgsConstructor
public class DevDataSeeder implements CommandLineRunner {

    private final AirportRepository  airportRepo;
    private final AirlineRepository  airlineRepo;
    private final FlightRepository   flightRepo;
    private final UserRepository     userRepo;
    private final PasswordEncoder    passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepo.count() > 0) return;

        // Airports
        airportRepo.save(Airport.builder().code("DEL").name("Indira Gandhi International Airport").city("New Delhi").country("India").timezone("Asia/Kolkata").build());
        airportRepo.save(Airport.builder().code("BOM").name("Chhatrapati Shivaji Maharaj International Airport").city("Mumbai").country("India").timezone("Asia/Kolkata").build());
        airportRepo.save(Airport.builder().code("BLR").name("Kempegowda International Airport").city("Bengaluru").country("India").timezone("Asia/Kolkata").build());
        airportRepo.save(Airport.builder().code("MAA").name("Chennai International Airport").city("Chennai").country("India").timezone("Asia/Kolkata").build());
        airportRepo.save(Airport.builder().code("HYD").name("Rajiv Gandhi International Airport").city("Hyderabad").country("India").timezone("Asia/Kolkata").build());
        airportRepo.save(Airport.builder().code("CCU").name("Netaji Subhas Chandra Bose International Airport").city("Kolkata").country("India").timezone("Asia/Kolkata").build());
        airportRepo.save(Airport.builder().code("GOI").name("Goa International Airport").city("Goa").country("India").timezone("Asia/Kolkata").build());
        airportRepo.save(Airport.builder().code("PNQ").name("Pune Airport").city("Pune").country("India").timezone("Asia/Kolkata").build());
        airportRepo.save(Airport.builder().code("AMD").name("Sardar Vallabhbhai Patel International Airport").city("Ahmedabad").country("India").timezone("Asia/Kolkata").build());
        airportRepo.save(Airport.builder().code("COK").name("Cochin International Airport").city("Kochi").country("India").timezone("Asia/Kolkata").build());

        // Airlines
        Airline indigo   = airlineRepo.save(Airline.builder().code("6E").name("IndiGo").logoUrl("https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/IndiGo_Airlines_logo.svg/200px-IndiGo_Airlines_logo.svg.png").build());
        Airline airIndia = airlineRepo.save(Airline.builder().code("AI").name("Air India").logoUrl("https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Air_India_Logo.svg/200px-Air_India_Logo.svg.png").build());
        Airline spiceJet = airlineRepo.save(Airline.builder().code("SG").name("SpiceJet").logoUrl("https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/SpiceJet_Logo.svg/200px-SpiceJet_Logo.svg.png").build());
        Airline vistara  = airlineRepo.save(Airline.builder().code("UK").name("Vistara").logoUrl("https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Vistara-Logo.svg/200px-Vistara-Logo.svg.png").build());
        Airline akasa    = airlineRepo.save(Airline.builder().code("QP").name("Akasa Air").logoUrl("https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Akasa_Air_logo.svg/200px-Akasa_Air_logo.svg.png").build());

        Airport del = airportRepo.findById("DEL").get();
        Airport bom = airportRepo.findById("BOM").get();
        Airport blr = airportRepo.findById("BLR").get();
        Airport maa = airportRepo.findById("MAA").get();
        Airport hyd = airportRepo.findById("HYD").get();
        Airport ccu = airportRepo.findById("CCU").get();
        Airport goi = airportRepo.findById("GOI").get();

        LocalDate today    = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        LocalDate day2     = today.plusDays(2);

        // DEL → BOM
        saveFlight("6E-1001", indigo,   del, bom, today,    "06:15", "08:25", 4899, 180, 23, 130, 0, CabinClass.ECONOMY);
        saveFlight("6E-1002", indigo,   del, bom, tomorrow, "06:15", "08:25", 5199, 180, 45, 130, 0, CabinClass.ECONOMY);
        saveFlight("6E-1003", indigo,   del, bom, day2,     "06:15", "08:25", 4799, 180, 60, 130, 0, CabinClass.ECONOMY);
        saveFlight("AI-2001", airIndia, del, bom, today,    "09:40", "11:55", 5460, 200, 12, 135, 0, CabinClass.ECONOMY);
        saveFlight("AI-2002", airIndia, del, bom, tomorrow, "09:40", "11:55", 5660, 200, 34, 135, 0, CabinClass.ECONOMY);
        saveFlight("SG-3001", spiceJet, del, bom, today,    "18:05", "20:20", 4390, 150,  8, 135, 0, CabinClass.ECONOMY);
        saveFlight("SG-3002", spiceJet, del, bom, tomorrow, "18:05", "20:20", 4590, 150, 28, 135, 0, CabinClass.ECONOMY);
        saveFlight("UK-4001", vistara,  del, bom, today,    "13:20", "16:45", 5120, 160, 31, 205, 1, CabinClass.ECONOMY);
        saveFlight("QP-5001", akasa,    del, bom, today,    "20:35", "22:45", 4725, 170, 26, 130, 0, CabinClass.ECONOMY);

        // BOM → DEL
        saveFlight("6E-1101", indigo,   bom, del, today,    "07:00", "09:10", 4799, 180, 40, 130, 0, CabinClass.ECONOMY);
        saveFlight("AI-2101", airIndia, bom, del, today,    "11:00", "13:15", 5200, 200, 55, 135, 0, CabinClass.ECONOMY);
        saveFlight("SG-3101", spiceJet, bom, del, today,    "16:30", "18:45", 4100, 150, 20, 135, 0, CabinClass.ECONOMY);

        // DEL → BLR
        saveFlight("6E-2001", indigo,   del, blr, today,    "07:30", "10:00", 5500, 180, 35, 150, 0, CabinClass.ECONOMY);
        saveFlight("AI-3001", airIndia, del, blr, today,    "10:15", "12:45", 6200, 200, 18, 150, 0, CabinClass.ECONOMY);
        saveFlight("UK-5001", vistara,  del, blr, today,    "15:00", "20:30", 7500, 160, 22, 330, 1, CabinClass.BUSINESS);

        // BOM → BLR
        saveFlight("6E-2101", indigo,   bom, blr, today,    "08:00", "09:30", 3800, 180, 50,  90, 0, CabinClass.ECONOMY);
        saveFlight("SG-4001", spiceJet, bom, blr, today,    "14:00", "15:35", 3500, 150, 42,  95, 0, CabinClass.ECONOMY);

        // DEL → MAA
        saveFlight("6E-3001", indigo,   del, maa, today,    "06:00", "08:45", 5800, 180, 30, 165, 0, CabinClass.ECONOMY);
        saveFlight("AI-4001", airIndia, del, maa, today,    "12:00", "14:50", 6400, 200, 25, 170, 0, CabinClass.ECONOMY);

        // BLR → HYD
        saveFlight("6E-4001", indigo,   blr, hyd, today,    "09:00", "10:05", 2800, 180, 60,  65, 0, CabinClass.ECONOMY);
        saveFlight("SG-5001", spiceJet, blr, hyd, today,    "17:00", "18:10", 2600, 150, 44,  70, 0, CabinClass.ECONOMY);

        // BOM → GOI
        saveFlight("6E-5001", indigo,   bom, goi, today,    "10:00", "11:15", 3200, 180, 55,  75, 0, CabinClass.ECONOMY);
        saveFlight("AI-5001", airIndia, bom, goi, today,    "16:00", "17:20", 3800, 200, 38,  80, 0, CabinClass.ECONOMY);

        // DEL → CCU
        saveFlight("6E-6001", indigo,   del, ccu, today,    "07:00", "09:20", 4500, 180, 28, 140, 0, CabinClass.ECONOMY);
        saveFlight("AI-6001", airIndia, del, ccu, today,    "13:30", "15:55", 5100, 200, 15, 145, 0, CabinClass.ECONOMY);

        // Admin user (password: Admin@123)
        userRepo.save(User.builder()
            .firstName("Admin").lastName("SkyFlow")
            .email("admin@skyflow.com")
            .password(passwordEncoder.encode("Admin@123"))
            .phone("9999999999").role(Role.ADMIN).build());

        // Sample user (password: Admin@123)
        userRepo.save(User.builder()
            .firstName("Priya").lastName("Sharma")
            .email("priya@example.com")
            .password(passwordEncoder.encode("Admin@123"))
            .phone("9876543210").role(Role.USER).build());

        System.out.println(">>> Dev seed data loaded: 25 flights, 10 airports, 5 airlines, 2 users");
    }

    private void saveFlight(String number, Airline airline, Airport origin, Airport dest,
                             LocalDate date, String dep, String arr,
                             int price, int total, int available, int duration, int stops, CabinClass cabin) {
        flightRepo.save(Flight.builder()
            .flightNumber(number)
            .airline(airline)
            .origin(origin)
            .destination(dest)
            .departureTime(LocalDateTime.of(date, LocalTime.parse(dep)))
            .arrivalTime(LocalDateTime.of(date, LocalTime.parse(arr)))
            .basePrice(BigDecimal.valueOf(price))
            .totalSeats(total)
            .availableSeats(available)
            .durationMinutes(duration)
            .stops(stops)
            .cabinClass(cabin)
            .status(FlightStatus.SCHEDULED)
            .build());
    }
}
