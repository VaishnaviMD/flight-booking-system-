package com.flightbooking.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private Double discountPercent;

    @Column(nullable = false)
    private Double maxDiscountAmount;

    @Column(nullable = false)
    private Double minBookingAmount;

    @Builder.Default
    private Boolean active = true;

    private LocalDateTime expiryDate;
}
