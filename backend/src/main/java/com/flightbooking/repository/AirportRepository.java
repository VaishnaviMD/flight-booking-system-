package com.flightbooking.repository;

import com.flightbooking.model.Airport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AirportRepository extends JpaRepository<Airport, String> {
    List<Airport> findByCountry(String country);
    List<Airport> findByCityContainingIgnoreCaseOrNameContainingIgnoreCase(String city, String name);
}
