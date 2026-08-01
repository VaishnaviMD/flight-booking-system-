package com.flightbooking.service.impl;

import com.flightbooking.dto.request.PaymentRequest;
import com.flightbooking.dto.response.PaymentResponse;
import com.flightbooking.exception.AppException;
import com.flightbooking.model.Booking;
import com.flightbooking.model.Payment;
import com.flightbooking.repository.BookingRepository;
import com.flightbooking.repository.PaymentRepository;
import com.flightbooking.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    @Override
    public PaymentResponse processPayment(PaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new AppException("Booking not found", HttpStatus.NOT_FOUND));

        if (request.getAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new AppException("Invalid payment amount", HttpStatus.BAD_REQUEST);
        }

        Payment payment = Payment.builder()
                .booking(booking)
                .transactionId("TXN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .status("SUCCESS")
                .build();

        paymentRepository.save(payment);

        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(booking.getId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .paidAt(payment.getPaidAt())
                .build();
    }
}
