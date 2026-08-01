-- V2: Seed Data — Indian airports, airlines, flights + admin user

-- Airports
INSERT INTO airports (code, name, city, country, timezone) VALUES
('DEL', 'Indira Gandhi International Airport', 'New Delhi',  'India', 'Asia/Kolkata'),
('BOM', 'Chhatrapati Shivaji Maharaj International Airport', 'Mumbai', 'India', 'Asia/Kolkata'),
('BLR', 'Kempegowda International Airport', 'Bengaluru', 'India', 'Asia/Kolkata'),
('MAA', 'Chennai International Airport', 'Chennai', 'India', 'Asia/Kolkata'),
('HYD', 'Rajiv Gandhi International Airport', 'Hyderabad', 'India', 'Asia/Kolkata'),
('CCU', 'Netaji Subhas Chandra Bose International Airport', 'Kolkata', 'India', 'Asia/Kolkata'),
('COK', 'Cochin International Airport', 'Kochi', 'India', 'Asia/Kolkata'),
('PNQ', 'Pune Airport', 'Pune', 'India', 'Asia/Kolkata'),
('AMD', 'Sardar Vallabhbhai Patel International Airport', 'Ahmedabad', 'India', 'Asia/Kolkata'),
('GOI', 'Goa International Airport', 'Goa', 'India', 'Asia/Kolkata');

-- Airlines
INSERT INTO airlines (code, name, logo_url) VALUES
('6E', 'IndiGo',    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/IndiGo_Airlines_logo.svg/200px-IndiGo_Airlines_logo.svg.png'),
('AI', 'Air India', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Air_India_Logo.svg/200px-Air_India_Logo.svg.png'),
('SG', 'SpiceJet',  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/SpiceJet_Logo.svg/200px-SpiceJet_Logo.svg.png'),
('UK', 'Vistara',   'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Vistara-Logo.svg/200px-Vistara-Logo.svg.png'),
('QP', 'Akasa Air', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Akasa_Air_logo.svg/200px-Akasa_Air_logo.svg.png');

-- Admin user (password: Admin@123)
INSERT INTO users (first_name, last_name, email, password, phone, role) VALUES
('Admin', 'SkyFlow', 'admin@skyflow.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LAbAoiNTfme',
 '9999999999', 'ADMIN');

-- Sample user (password: User@123)
INSERT INTO users (first_name, last_name, email, password, phone, role) VALUES
('Priya', 'Sharma', 'priya@example.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LAbAoiNTfme',
 '9876543210', 'USER');

-- Flights DEL → BOM (today + next 7 days pattern)
INSERT INTO flights (flight_number, airline_code, origin_code, destination_code, departure_time, arrival_time, base_price, total_seats, available_seats, duration_minutes, stops, cabin_class, status) VALUES
('6E-1001', '6E', 'DEL', 'BOM', NOW()::date + INTERVAL '0 days' + TIME '06:15', NOW()::date + INTERVAL '0 days' + TIME '08:25', 4899.00, 180, 23, 130, 0, 'ECONOMY', 'SCHEDULED'),
('6E-1002', '6E', 'DEL', 'BOM', NOW()::date + INTERVAL '1 days' + TIME '06:15', NOW()::date + INTERVAL '1 days' + TIME '08:25', 5199.00, 180, 45, 130, 0, 'ECONOMY', 'SCHEDULED'),
('6E-1003', '6E', 'DEL', 'BOM', NOW()::date + INTERVAL '2 days' + TIME '06:15', NOW()::date + INTERVAL '2 days' + TIME '08:25', 4799.00, 180, 60, 130, 0, 'ECONOMY', 'SCHEDULED'),
('AI-2001', 'AI', 'DEL', 'BOM', NOW()::date + INTERVAL '0 days' + TIME '09:40', NOW()::date + INTERVAL '0 days' + TIME '11:55', 5460.00, 200, 12, 135, 0, 'ECONOMY', 'SCHEDULED'),
('AI-2002', 'AI', 'DEL', 'BOM', NOW()::date + INTERVAL '1 days' + TIME '09:40', NOW()::date + INTERVAL '1 days' + TIME '11:55', 5660.00, 200, 34, 135, 0, 'ECONOMY', 'SCHEDULED'),
('SG-3001', 'SG', 'DEL', 'BOM', NOW()::date + INTERVAL '0 days' + TIME '18:05', NOW()::date + INTERVAL '0 days' + TIME '20:20', 4390.00, 150, 8,  135, 0, 'ECONOMY', 'SCHEDULED'),
('SG-3002', 'SG', 'DEL', 'BOM', NOW()::date + INTERVAL '1 days' + TIME '18:05', NOW()::date + INTERVAL '1 days' + TIME '20:20', 4590.00, 150, 28, 135, 0, 'ECONOMY', 'SCHEDULED'),
('UK-4001', 'UK', 'DEL', 'BOM', NOW()::date + INTERVAL '0 days' + TIME '13:20', NOW()::date + INTERVAL '0 days' + TIME '16:45', 5120.00, 160, 31, 205, 1, 'ECONOMY', 'SCHEDULED'),
('QP-5001', 'QP', 'DEL', 'BOM', NOW()::date + INTERVAL '0 days' + TIME '20:35', NOW()::date + INTERVAL '0 days' + TIME '22:45', 4725.00, 170, 26, 130, 0, 'ECONOMY', 'SCHEDULED'),

-- BOM → DEL
('6E-1101', '6E', 'BOM', 'DEL', NOW()::date + INTERVAL '0 days' + TIME '07:00', NOW()::date + INTERVAL '0 days' + TIME '09:10', 4799.00, 180, 40, 130, 0, 'ECONOMY', 'SCHEDULED'),
('AI-2101', 'AI', 'BOM', 'DEL', NOW()::date + INTERVAL '0 days' + TIME '11:00', NOW()::date + INTERVAL '0 days' + TIME '13:15', 5200.00, 200, 55, 135, 0, 'ECONOMY', 'SCHEDULED'),
('SG-3101', 'SG', 'BOM', 'DEL', NOW()::date + INTERVAL '0 days' + TIME '16:30', NOW()::date + INTERVAL '0 days' + TIME '18:45', 4100.00, 150, 20, 135, 0, 'ECONOMY', 'SCHEDULED'),

-- DEL → BLR
('6E-2001', '6E', 'DEL', 'BLR', NOW()::date + INTERVAL '0 days' + TIME '07:30', NOW()::date + INTERVAL '0 days' + TIME '10:00', 5500.00, 180, 35, 150, 0, 'ECONOMY', 'SCHEDULED'),
('AI-3001', 'AI', 'DEL', 'BLR', NOW()::date + INTERVAL '0 days' + TIME '10:15', NOW()::date + INTERVAL '0 days' + TIME '12:45', 6200.00, 200, 18, 150, 0, 'ECONOMY', 'SCHEDULED'),
('UK-5001', 'UK', 'DEL', 'BLR', NOW()::date + INTERVAL '0 days' + TIME '15:00', NOW()::date + INTERVAL '0 days' + TIME '20:30', 7500.00, 160, 22, 330, 1, 'BUSINESS', 'SCHEDULED'),

-- BOM → BLR
('6E-2101', '6E', 'BOM', 'BLR', NOW()::date + INTERVAL '0 days' + TIME '08:00', NOW()::date + INTERVAL '0 days' + TIME '09:30', 3800.00, 180, 50, 90,  0, 'ECONOMY', 'SCHEDULED'),
('SG-4001', 'SG', 'BOM', 'BLR', NOW()::date + INTERVAL '0 days' + TIME '14:00', NOW()::date + INTERVAL '0 days' + TIME '15:35', 3500.00, 150, 42, 95,  0, 'ECONOMY', 'SCHEDULED'),

-- DEL → MAA
('6E-3001', '6E', 'DEL', 'MAA', NOW()::date + INTERVAL '0 days' + TIME '06:00', NOW()::date + INTERVAL '0 days' + TIME '08:45', 5800.00, 180, 30, 165, 0, 'ECONOMY', 'SCHEDULED'),
('AI-4001', 'AI', 'DEL', 'MAA', NOW()::date + INTERVAL '0 days' + TIME '12:00', NOW()::date + INTERVAL '0 days' + TIME '14:50', 6400.00, 200, 25, 170, 0, 'ECONOMY', 'SCHEDULED'),

-- BLR → HYD
('6E-4001', '6E', 'BLR', 'HYD', NOW()::date + INTERVAL '0 days' + TIME '09:00', NOW()::date + INTERVAL '0 days' + TIME '10:05', 2800.00, 180, 60, 65,  0, 'ECONOMY', 'SCHEDULED'),
('SG-5001', 'SG', 'BLR', 'HYD', NOW()::date + INTERVAL '0 days' + TIME '17:00', NOW()::date + INTERVAL '0 days' + TIME '18:10', 2600.00, 150, 44, 70,  0, 'ECONOMY', 'SCHEDULED'),

-- BOM → GOI
('6E-5001', '6E', 'BOM', 'GOI', NOW()::date + INTERVAL '0 days' + TIME '10:00', NOW()::date + INTERVAL '0 days' + TIME '11:15', 3200.00, 180, 55, 75,  0, 'ECONOMY', 'SCHEDULED'),
('AI-5001', 'AI', 'BOM', 'GOI', NOW()::date + INTERVAL '0 days' + TIME '16:00', NOW()::date + INTERVAL '0 days' + TIME '17:20', 3800.00, 200, 38, 80,  0, 'ECONOMY', 'SCHEDULED'),

-- DEL → CCU
('6E-6001', '6E', 'DEL', 'CCU', NOW()::date + INTERVAL '0 days' + TIME '07:00', NOW()::date + INTERVAL '0 days' + TIME '09:20', 4500.00, 180, 28, 140, 0, 'ECONOMY', 'SCHEDULED'),
('AI-6001', 'AI', 'DEL', 'CCU', NOW()::date + INTERVAL '0 days' + TIME '13:30', NOW()::date + INTERVAL '0 days' + TIME '15:55', 5100.00, 200, 15, 145, 0, 'ECONOMY', 'SCHEDULED');
