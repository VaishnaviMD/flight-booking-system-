package com.flightbooking.service.impl;

import com.flightbooking.dto.response.CouponResponse;
import com.flightbooking.model.Coupon;
import com.flightbooking.repository.CouponRepository;
import com.flightbooking.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    @Override
    public CouponResponse applyCoupon(String code, Double amount) {
        if (code == null || code.isBlank()) {
            return CouponResponse.builder()
                    .valid(false)
                    .message("Coupon code cannot be empty")
                    .discountAmount(0.0)
                    .finalAmount(amount)
                    .build();
        }

        Optional<Coupon> opt = couponRepository.findByCodeAndActiveTrue(code.toUpperCase().trim());
        if (opt.isEmpty()) {
            return CouponResponse.builder()
                    .valid(false)
                    .message("Invalid or expired coupon code")
                    .discountAmount(0.0)
                    .finalAmount(amount)
                    .build();
        }

        Coupon coupon = opt.get();
        if (amount < coupon.getMinBookingAmount()) {
            return CouponResponse.builder()
                    .valid(false)
                    .message("Minimum booking amount for this coupon is ₹" + coupon.getMinBookingAmount())
                    .discountAmount(0.0)
                    .finalAmount(amount)
                    .build();
        }

        double calculatedDiscount = (amount * coupon.getDiscountPercent()) / 100.0;
        double discount = Math.min(calculatedDiscount, coupon.getMaxDiscountAmount());
        double finalAmount = Math.max(0.0, amount - discount);

        return CouponResponse.builder()
                .code(coupon.getCode())
                .valid(true)
                .message("Coupon " + coupon.getCode() + " applied successfully! Saved ₹" + (int) discount)
                .discountAmount((double) Math.round(discount))
                .finalAmount((double) Math.round(finalAmount))
                .build();
    }
}
