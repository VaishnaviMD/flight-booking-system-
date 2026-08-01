package com.flightbooking.service;

import com.flightbooking.dto.request.BookingRequest;
import com.flightbooking.dto.response.BookingResponse;

import java.util.List;

public interface BookingService {
    BookingResponse createBooking(BookingRequest request, String userEmail);
    List<BookingResponse> getMyBookings(String userEmail);
    BookingResponse getByPnr(String pnr);
    BookingResponse getById(Long id);
    BookingResponse cancelBooking(Long id, String userEmail);
    List<BookingResponse> getAllBookings();
}
