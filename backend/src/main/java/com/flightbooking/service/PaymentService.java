package com.flightbooking.service;

import com.flightbooking.dto.request.PaymentRequest;
import com.flightbooking.dto.response.PaymentResponse;

public interface PaymentService {
    PaymentResponse processPayment(PaymentRequest request);
}
