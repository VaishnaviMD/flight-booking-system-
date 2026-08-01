-- V1: Initial Schema

CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    phone       VARCHAR(20),
    role        VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE airports (
    code     VARCHAR(3) PRIMARY KEY,
    name     VARCHAR(200) NOT NULL,
    city     VARCHAR(100) NOT NULL,
    country  VARCHAR(100) NOT NULL,
    timezone VARCHAR(50)
);

CREATE TABLE airlines (
    code     VARCHAR(10) PRIMARY KEY,
    name     VARCHAR(200) NOT NULL,
    logo_url VARCHAR(500)
);

CREATE TABLE flights (
    id               BIGSERIAL PRIMARY KEY,
    flight_number    VARCHAR(20) NOT NULL UNIQUE,
    airline_code     VARCHAR(10) NOT NULL REFERENCES airlines(code),
    origin_code      VARCHAR(3)  NOT NULL REFERENCES airports(code),
    destination_code VARCHAR(3)  NOT NULL REFERENCES airports(code),
    departure_time   TIMESTAMP   NOT NULL,
    arrival_time     TIMESTAMP   NOT NULL,
    base_price       NUMERIC(10,2) NOT NULL,
    total_seats      INT NOT NULL,
    available_seats  INT NOT NULL,
    duration_minutes INT NOT NULL,
    stops            INT NOT NULL DEFAULT 0,
    cabin_class      VARCHAR(20) NOT NULL DEFAULT 'ECONOMY',
    status           VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED'
);

CREATE TABLE bookings (
    id               BIGSERIAL PRIMARY KEY,
    pnr              VARCHAR(20) NOT NULL UNIQUE,
    user_id          BIGINT NOT NULL REFERENCES users(id),
    flight_id        BIGINT NOT NULL REFERENCES flights(id),
    return_flight_id BIGINT REFERENCES flights(id),
    cabin_class      VARCHAR(20) NOT NULL,
    total_amount     NUMERIC(10,2) NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    booked_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE passengers (
    id              BIGSERIAL PRIMARY KEY,
    booking_id      BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    date_of_birth   DATE,
    passport_number VARCHAR(50),
    seat_number     VARCHAR(10),
    type            VARCHAR(20) DEFAULT 'ADULT'
);

CREATE INDEX idx_flights_origin_dest_date ON flights(origin_code, destination_code, departure_time);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_pnr ON bookings(pnr);
