package com.flightbooking.repository;

import com.flightbooking.model.CabinClass;
import com.flightbooking.model.Flight;
import com.flightbooking.model.FlightStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface FlightRepository extends JpaRepository<Flight, Long>, JpaSpecificationExecutor<Flight> {

    @Query("""
        SELECT f FROM Flight f
        JOIN FETCH f.airline
        JOIN FETCH f.origin
        JOIN FETCH f.destination
        WHERE f.origin.code = :origin
        AND f.destination.code = :destination
        AND f.departureTime >= :from
        AND f.departureTime < :to
        AND f.status = 'SCHEDULED'
        AND f.availableSeats >= :passengers
        """)
    List<Flight> searchFlights(
        @Param("origin") String origin,
        @Param("destination") String destination,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to,
        @Param("passengers") int passengers
    );

    long countByStatus(FlightStatus status);
}
