-- ============================================================
-- V5: Booking flow enhancements
--  1. Flight metadata (aircraft, baggage, meal, refund policy, fare rules)
--  2. Extended traveller details on passengers
--  3. Booking contact + cancellation tracking
--  4. Seat inventory table (used by interactive seat selection)
--  5. FIX seed passwords: the V2 hash did NOT match the documented demo
--     password "Admin@123" — logins against PostgreSQL were failing.
--  6. Schedule flights for the next 30 days so future-date searches
--     return real results (no frontend fallback needed).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Flight metadata
-- ------------------------------------------------------------
ALTER TABLE flights ADD COLUMN IF NOT EXISTS aircraft_type    VARCHAR(100)  DEFAULT 'Airbus A320neo';
ALTER TABLE flights ADD COLUMN IF NOT EXISTS baggage_checkin  VARCHAR(100)  DEFAULT '15 Kg';
ALTER TABLE flights ADD COLUMN IF NOT EXISTS baggage_cabin    VARCHAR(100)  DEFAULT '7 Kg';
ALTER TABLE flights ADD COLUMN IF NOT EXISTS meal_included    BOOLEAN       DEFAULT TRUE;
ALTER TABLE flights ADD COLUMN IF NOT EXISTS refundable       BOOLEAN       DEFAULT TRUE;
ALTER TABLE flights ADD COLUMN IF NOT EXISTS fare_rules       VARCHAR(1000)
    DEFAULT 'Free cancellation up to 24 hours before departure. Cancellations within 24 hours of departure incur a 20% fee. No-shows are non-refundable.';

UPDATE flights SET baggage_checkin = '25 Kg' WHERE cabin_class = 'BUSINESS';
UPDATE flights SET refundable = FALSE WHERE flight_number LIKE 'SG-%';

-- ------------------------------------------------------------
-- 2. Extended traveller details on passengers
-- ------------------------------------------------------------
ALTER TABLE passengers ADD COLUMN IF NOT EXISTS gender                  VARCHAR(20);
ALTER TABLE passengers ADD COLUMN IF NOT EXISTS age                     INT;
ALTER TABLE passengers ADD COLUMN IF NOT EXISTS nationality             VARCHAR(100) DEFAULT 'Indian';
ALTER TABLE passengers ADD COLUMN IF NOT EXISTS meal_preference         VARCHAR(50);
ALTER TABLE passengers ADD COLUMN IF NOT EXISTS seat_preference         VARCHAR(50);
ALTER TABLE passengers ADD COLUMN IF NOT EXISTS special_assistance      VARCHAR(200);
ALTER TABLE passengers ADD COLUMN IF NOT EXISTS emergency_contact_name  VARCHAR(100);
ALTER TABLE passengers ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20);
ALTER TABLE passengers ADD COLUMN IF NOT EXISTS ticket_number           VARCHAR(30);

-- ------------------------------------------------------------
-- 3. Booking contact + cancellation tracking
-- ------------------------------------------------------------
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS contact_email       VARCHAR(150);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS contact_phone       VARCHAR(20);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(500);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_amount       NUMERIC(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at        TIMESTAMP;

-- ------------------------------------------------------------
-- 4. Seat inventory (per-flight seat map)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seats (
    id             BIGSERIAL PRIMARY KEY,
    flight_id      BIGINT NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
    seat_number    VARCHAR(10) NOT NULL,
    cabin_class    VARCHAR(20) NOT NULL,
    seat_type      VARCHAR(20) NOT NULL DEFAULT 'MIDDLE',   -- WINDOW | MIDDLE | AISLE
    row_number     INT NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE | BOOKED | RESERVED
    reserved_until TIMESTAMP,
    reserved_by    VARCHAR(150),
    CONSTRAINT uq_seats_flight_seat UNIQUE (flight_id, seat_number)
);
CREATE INDEX IF NOT EXISTS idx_seats_flight ON seats(flight_id);

-- ------------------------------------------------------------
-- 5. Fix the seeded demo passwords (both accounts = Admin@123).
--    The hash below was generated with the same BCryptPasswordEncoder
--    version used by the backend, so Spring Security accepts it.
-- ------------------------------------------------------------
UPDATE users
SET password = '$2a$10$ANZUOBfeu5gsI21hv6pi7.f6Lap2V/8mGIOw8q6PTPeWb7aKeiNeu'
WHERE email IN ('admin@skyflow.com', 'priya@example.com');

-- ------------------------------------------------------------
-- 6. Flights for the next 30 days (days 2..31 — V2 already covers
--    today and tomorrow). One flight per template per day, with
--    deterministic day-based price/seat variation.
-- ------------------------------------------------------------
WITH templates (seq, airline, origin, dest, dep, arr, price, seats, duration, stops, cabin, aircraft) AS (
    VALUES
        (1,  '6E', 'DEL', 'BOM', '06:15', '08:25', 4899, 180, 130, 0, 'ECONOMY',  'Airbus A320neo'),
        (2,  'AI', 'DEL', 'BOM', '09:40', '11:55', 5460, 200, 135, 0, 'ECONOMY',  'Boeing 787-8'),
        (3,  'SG', 'DEL', 'BOM', '18:05', '20:20', 4390, 150, 135, 0, 'ECONOMY',  'Boeing 737-800'),
        (4,  'UK', 'DEL', 'BOM', '13:20', '16:45', 5120, 160, 205, 1, 'ECONOMY',  'Airbus A321neo'),
        (5,  'QP', 'DEL', 'BOM', '20:35', '22:45', 4725, 170, 130, 0, 'ECONOMY',  'Boeing 737 MAX 8'),
        (6,  '6E', 'BOM', 'DEL', '07:00', '09:10', 4799, 180, 130, 0, 'ECONOMY',  'Airbus A321neo'),
        (7,  'AI', 'BOM', 'DEL', '11:00', '13:15', 5200, 200, 135, 0, 'ECONOMY',  'Boeing 787-8'),
        (8,  'SG', 'BOM', 'DEL', '16:30', '18:45', 4100, 150, 135, 0, 'ECONOMY',  'Boeing 737-800'),
        (9,  '6E', 'DEL', 'BLR', '07:30', '10:00', 5500, 180, 150, 0, 'ECONOMY',  'Airbus A320neo'),
        (10, 'AI', 'DEL', 'BLR', '10:15', '12:45', 6200, 200, 150, 0, 'ECONOMY',  'Airbus A320neo'),
        (11, 'UK', 'DEL', 'BLR', '15:00', '20:30', 7500, 160, 330, 1, 'BUSINESS', 'Boeing 787-9'),
        (12, '6E', 'BOM', 'BLR', '08:00', '09:30', 3800, 180,  90, 0, 'ECONOMY',  'Airbus A320neo'),
        (13, 'SG', 'BOM', 'BLR', '14:00', '15:35', 3500, 150,  95, 0, 'ECONOMY',  'Boeing 737-800'),
        (14, '6E', 'DEL', 'MAA', '06:00', '08:45', 5800, 180, 165, 0, 'ECONOMY',  'Airbus A321neo'),
        (15, 'AI', 'DEL', 'MAA', '12:00', '14:50', 6400, 200, 170, 0, 'ECONOMY',  'Boeing 787-8'),
        (16, '6E', 'BLR', 'HYD', '09:00', '10:05', 2800, 180,  65, 0, 'ECONOMY',  'Airbus A320neo'),
        (17, 'SG', 'BLR', 'HYD', '17:00', '18:10', 2600, 150,  70, 0, 'ECONOMY',  'Boeing 737-800'),
        (18, '6E', 'BOM', 'GOI', '10:00', '11:15', 3200, 180,  75, 0, 'ECONOMY',  'Airbus A320neo'),
        (19, 'AI', 'BOM', 'GOI', '16:00', '17:20', 3800, 200,  80, 0, 'ECONOMY',  'Boeing 787-8'),
        (20, '6E', 'DEL', 'CCU', '07:00', '09:20', 4500, 180, 140, 0, 'ECONOMY',  'Airbus A320neo'),
        (21, 'AI', 'DEL', 'CCU', '13:30', '15:55', 5100, 200, 145, 0, 'ECONOMY',  'Boeing 787-8')
),
days AS (
    SELECT generate_series(2, 31) AS d
)
INSERT INTO flights (
    flight_number, airline_code, origin_code, destination_code,
    departure_time, arrival_time, base_price, total_seats, available_seats,
    duration_minutes, stops, cabin_class, status,
    aircraft_type, baggage_checkin, baggage_cabin, meal_included, refundable, fare_rules
)
SELECT
    t.airline || '-' || (9000 + t.seq * 100 + d)::text,
    t.airline,
    t.origin,
    t.dest,
    (CURRENT_DATE + d) + t.dep::time,
    (CURRENT_DATE + d) + t.arr::time,
    t.price + (d * 15),
    t.seats,
    GREATEST(5, t.seats - ((d * 13) % (t.seats - 30)) - 10),
    t.duration,
    t.stops,
    t.cabin,
    'SCHEDULED',
    t.aircraft,
    CASE WHEN t.cabin = 'BUSINESS' THEN '25 Kg' ELSE '15 Kg' END,
    '7 Kg',
    TRUE,
    t.airline <> 'SG',
    'Free cancellation up to 24 hours before departure. Cancellations within 24 hours of departure incur a 20% fee. No-shows are non-refundable.'
FROM templates t
CROSS JOIN days d;