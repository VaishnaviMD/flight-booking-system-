package com.flightbooking.repository;

import com.flightbooking.model.Airline;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AirlineRepository extends JpaRepository<Airline, String> {
}
