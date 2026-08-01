CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_percent DOUBLE PRECISION NOT NULL,
    max_discount_amount DOUBLE PRECISION NOT NULL,
    min_booking_amount DOUBLE PRECISION NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    expiry_date TIMESTAMP
);

INSERT INTO coupons (code, discount_percent, max_discount_amount, min_booking_amount, active)
VALUES 
('FLY500', 15.0, 500.0, 2000.0, TRUE),
('SAVER10', 10.0, 1000.0, 1500.0, TRUE),
('SKYFLOW20', 20.0, 1500.0, 3000.0, TRUE);
