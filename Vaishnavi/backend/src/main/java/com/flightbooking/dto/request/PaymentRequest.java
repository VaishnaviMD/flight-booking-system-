package com.flightbooking.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequest {
    @NotNull
    private Long bookingId;

    @NotNull
    @Min(0)
    private BigDecimal amount;

    @NotBlank
    private String paymentMethod;

    private String cardNumber;
}
