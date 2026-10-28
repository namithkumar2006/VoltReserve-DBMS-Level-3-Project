-- ============================================================================
-- DBMS Experiential Learning - Level 3 Project
-- Title: VoltReserve - Sample Data Population (Seed Script)
-- Bengaluru Charging Network Setup
-- ============================================================================

-- 1. Insert Users (Customers & Administrators)
INSERT INTO users (user_id, full_name, email, password_hash, role, phone_number, wallet_balance) VALUES
('usr_001', 'Namith Kumar Chandrakumar', 'namith@ev.com', 'scrypt_pass_123', 'CUSTOMER', '+91 98450 11223', 1450.00),
('usr_002', 'Kushal G', 'kushal@ev.com', 'scrypt_pass_123', 'CUSTOMER', '+91 98450 44556', 2200.00),
('usr_003', 'Ananya Deshmukh', 'ananya@ev.com', 'scrypt_pass_123', 'CUSTOMER', '+91 98450 77889', 850.00),
('usr_004', 'Vikramaditya Rao', 'vikram@ev.com', 'scrypt_pass_123', 'CUSTOMER', '+91 98450 99001', 3100.00),
('usr_admin', 'Station Network Admin', 'admin@ev.com', 'scrypt_admin_pass', 'ADMIN', '+91 80 2345 6789', 50000.00)
ON CONFLICT (user_id) DO NOTHING;

-- 2. Insert Vehicles
INSERT INTO vehicles (vehicle_id, user_id, make, model, registration_no, battery_capacity_kwh, connector_type) VALUES
('veh_001', 'usr_001', 'Tata', 'Nexon EV Empowered', 'KA-01-MJ-4040', 40.5, 'CCS2'),
('veh_002', 'usr_002', 'MG', 'ZS EV Exclusive', 'KA-03-NB-8899', 50.3, 'CCS2'),
('veh_003', 'usr_003', 'Mahindra', 'XUV400 Pro', 'KA-05-EV-1234', 39.4, 'CCS2'),
('veh_004', 'usr_004', 'Hyundai', 'Ioniq 5 Long Range', 'KA-51-AB-9999', 72.6, 'CCS2')
ON CONFLICT (vehicle_id) DO NOTHING;

-- 3. Insert Charging Stations (Bengaluru Hotspots)
INSERT INTO charging_stations (station_id, name, address, city, pincode, latitude, longitude, total_ports, operational_status) VALUES
('stn_001', 'Indiranagar 100ft Hub', '100 Feet Road, HAL 2nd Stage, Indiranagar', 'Bengaluru', '560038', 12.971891, 77.641154, 4, 'OPERATIONAL'),
('stn_002', 'Koramangala Sony Signal Plaza', '80 Feet Road, 4th Block, Koramangala', 'Bengaluru', '560034', 12.935193, 77.624481, 4, 'OPERATIONAL'),
('stn_003', 'Whitefield ITPL TechPark', 'Pattandur Agrahara, Whitefield', 'Bengaluru', '560066', 12.986872, 77.738197, 4, 'OPERATIONAL'),
('stn_004', 'Electronic City Phase 1 E-Hub', 'Hosur Road, Near Toll Plaza, Electronic City', 'Bengaluru', '560100', 12.845214, 77.660168, 4, 'OPERATIONAL'),
('stn_005', 'MG Road Metro Supercharge', 'MG Road, Central Business District', 'Bengaluru', '560001', 12.975618, 77.606628, 4, 'OPERATIONAL')
ON CONFLICT (station_id) DO NOTHING;

-- 4. Insert Tariffs per Station
INSERT INTO tariffs (tariff_id, station_id, base_rate_per_kwh, peak_hour_rate_per_kwh, peak_start_time, peak_end_time, idle_fee_per_min) VALUES
('trf_001', 'stn_001', 16.50, 22.00, '17:00:00', '22:00:00', 2.00),
('trf_002', 'stn_002', 17.00, 23.50, '17:00:00', '22:00:00', 2.50),
('trf_003', 'stn_003', 15.00, 20.00, '18:00:00', '23:00:00', 1.50),
('trf_004', 'stn_004', 14.50, 19.00, '17:00:00', '21:00:00', 1.50),
('trf_005', 'stn_005', 18.00, 25.00, '16:00:00', '22:00:00', 3.00)
ON CONFLICT (tariff_id) DO NOTHING;

-- 5. Insert Chargers
INSERT INTO chargers (charger_id, station_id, charger_identifier, connector_type, max_power_kw, current_status) VALUES
-- Indiranagar (stn_001)
('chg_101', 'stn_001', 'GUN-1A (DC Fast)', 'CCS2', 60.0, 'AVAILABLE'),
('chg_102', 'stn_001', 'GUN-1B (DC Fast)', 'CCS2', 60.0, 'AVAILABLE'),
('chg_103', 'stn_001', 'GUN-2A (Ultra DC)', 'CCS2', 150.0, 'RESERVED'),
('chg_104', 'stn_001', 'GUN-3A (AC Slow)', 'Type 2', 22.0, 'AVAILABLE'),

-- Koramangala (stn_002)
('chg_201', 'stn_002', 'GUN-1A (DC Fast)', 'CCS2', 50.0, 'OCCUPIED'),
('chg_202', 'stn_002', 'GUN-1B (DC Fast)', 'CCS2', 50.0, 'AVAILABLE'),
('chg_203', 'stn_002', 'GUN-2A (Hyper DC)', 'CCS2', 120.0, 'AVAILABLE'),
('chg_204', 'stn_002', 'GUN-3A (AC Slow)', 'Type 2', 22.0, 'UNDER_MAINTENANCE'),

-- Whitefield (stn_003)
('chg_301', 'stn_003', 'GUN-1A (DC Fast)', 'CCS2', 60.0, 'AVAILABLE'),
('chg_302', 'stn_003', 'GUN-1B (DC Fast)', 'CCS2', 60.0, 'AVAILABLE'),
('chg_303', 'stn_003', 'GUN-2A (Ultra DC)', 'CCS2', 150.0, 'AVAILABLE'),
('chg_304', 'stn_003', 'GUN-3A (Type 2)', 'Type 2', 22.0, 'AVAILABLE'),

-- Electronic City (stn_004)
('chg_401', 'stn_004', 'GUN-1A (DC Fast)', 'CCS2', 60.0, 'AVAILABLE'),
('chg_402', 'stn_004', 'GUN-2A (DC Fast)', 'CCS2', 60.0, 'AVAILABLE'),
('chg_403', 'stn_004', 'GUN-3A (Type 2)', 'Type 2', 22.0, 'AVAILABLE'),
('chg_404', 'stn_004', 'GUN-4A (CHAdeMO)', 'CHAdeMO', 50.0, 'AVAILABLE'),

-- MG Road (stn_005)
('chg_501', 'stn_005', 'GUN-1A (Ultra DC)', 'CCS2', 150.0, 'AVAILABLE'),
('chg_502', 'stn_005', 'GUN-1B (Ultra DC)', 'CCS2', 150.0, 'AVAILABLE'),
('chg_503', 'stn_005', 'GUN-2A (DC Fast)', 'CCS2', 60.0, 'AVAILABLE'),
('chg_504', 'stn_005', 'GUN-3A (AC Slow)', 'Type 2', 22.0, 'AVAILABLE')
ON CONFLICT (charger_id) DO NOTHING;

-- 6. Insert Reservations
INSERT INTO reservations (reservation_id, user_id, vehicle_id, charger_id, start_time, end_time, status, estimated_cost) VALUES
('res_001', 'usr_001', 'veh_001', 'chg_101', '2026-10-28 10:00:00', '2026-10-28 11:00:00', 'COMPLETED', 495.00),
('res_002', 'usr_002', 'veh_002', 'chg_103', '2026-10-28 11:30:00', '2026-10-28 12:30:00', 'ACTIVE', 550.00),
('res_003', 'usr_003', 'veh_003', 'chg_201', '2026-10-28 09:30:00', '2026-10-28 10:45:00', 'IN_PROGRESS', 510.00),
('res_004', 'usr_004', 'veh_004', 'chg_301', '2026-10-28 14:00:00', '2026-10-28 15:00:00', 'ACTIVE', 450.00),
('res_005', 'usr_001', 'veh_001', 'chg_501', '2026-10-27 18:00:00', '2026-10-27 19:00:00', 'COMPLETED', 600.00)
ON CONFLICT (reservation_id) DO NOTHING;

-- 7. Insert Historical Charging Sessions with Billing
INSERT INTO charging_sessions (session_id, reservation_id, charger_id, user_id, vehicle_id, actual_start_time, actual_end_time, initial_soc, final_soc, energy_delivered_kwh, energy_cost, peak_surcharge, gst_tax, total_amount, payment_status) VALUES
('sess_001', 'res_001', 'chg_101', 'usr_001', 'veh_001', '2026-10-28 10:02:00', '2026-10-28 10:58:00', 22, 85, 25.50, 420.75, 0.00, 75.74, 496.49, 'PAID'),
('sess_002', 'res_005', 'chg_501', 'usr_001', 'veh_001', '2026-10-27 18:05:00', '2026-10-27 18:55:00', 30, 90, 24.30, 437.40, 170.10, 109.35, 716.85, 'PAID'),
('sess_003', NULL, 'chg_301', 'usr_004', 'veh_004', '2026-10-27 12:00:00', '2026-10-27 13:00:00', 15, 80, 47.10, 706.50, 0.00, 127.17, 833.67, 'PAID')
ON CONFLICT (session_id) DO NOTHING;

-- 8. Insert User Reviews
INSERT INTO user_reviews (review_id, user_id, station_id, rating, comment) VALUES
('rev_001', 'usr_001', 'stn_001', 5, 'Super fast 60kW charging, got my Nexon from 20% to 80% in 45 mins. Clean bay and shade!'),
('rev_002', 'usr_002', 'stn_002', 4, 'Very accessible near Sony Signal, coffee shop next door is great while waiting.'),
('rev_003', 'usr_004', 'stn_005', 5, 'Ultra DC 150kW charger charged my Ioniq 5 in 18 minutes! Best in Bangalore central.')
ON CONFLICT (review_id) DO NOTHING;
