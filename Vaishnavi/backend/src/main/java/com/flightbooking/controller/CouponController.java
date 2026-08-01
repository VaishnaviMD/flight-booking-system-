package com.flightbooking.controller;

import com.flightbooking.dto.response.CouponResponse;
import com.flightbooking.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @GetMapping("/apply")
    public ResponseEntity<CouponResponse> applyCoupon(@RequestParam String code, @RequestParam Double amount) {
        return ResponseEntity.ok(couponService.applyCoupon(code, amount));
    }
}
