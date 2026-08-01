package com.flightbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponResponse {
    private String code;
    private Double discountAmount;
    private Double finalAmount;
    private Boolean valid;
    private String message;
}
