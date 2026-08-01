package com.flightbooking.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "airlines")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Airline {

    @Id
    @Column(length = 10)
    private String code;

    @Column(nullable = false)
    private String name;

    private String logoUrl;
}
