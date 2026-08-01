package com.flightbooking.service;

import com.flightbooking.dto.response.CouponResponse;

public interface CouponService {
    CouponResponse applyCoupon(String code, Double amount);
}
