-- ============================================================================
-- DBMS Experiential Learning - Level 3 Project
-- Title: VoltReserve - EV Charging Network & Smart Reservation Management System
-- Team Members:
--   1. Namith Kumar Chandrakumar (SRN: PES1UG24AM171)
--   2. Kushal G (SRN: PES1UG24AM145)
-- Department of Computer Science & Engineering, PES University
-- Guide: Dr. Nagasundari S
-- ============================================================================
-- DDL SCRIPT: Relational Schema Definition (Normalized to BCNF)
-- Engine: PostgreSQL / MySQL 8.0+ Compatible
-- ============================================================================

-- Clean up existing tables if any (Dependency Order)
DROP TABLE IF EXISTS charging_sessions CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS chargers CASCADE;
DROP TABLE IF EXISTS tariffs CASCADE;
DROP TABLE IF EXISTS user_reviews CASCADE;
DROP TABLE IF EXISTS charging_stations CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- Represents registered system users with Role-Based Access Control (RBAC)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN', 'STATION_STAFF')),
    phone_number VARCHAR(15),
    wallet_balance DECIMAL(10, 2) NOT NULL DEFAULT 500.00 CHECK (wallet_balance >= 0.00),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for authentication lookups
CREATE INDEX idx_users_email ON users(email);

-- ----------------------------------------------------------------------------
-- 2. VEHICLES TABLE
-- Stores EV details owned by customers; enforces 1:N relationship (User -> Vehicles)
-- ----------------------------------------------------------------------------
CREATE TABLE vehicles (
    vehicle_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    registration_no VARCHAR(20) NOT NULL UNIQUE,
    battery_capacity_kwh DECIMAL(5, 2) NOT NULL CHECK (battery_capacity_kwh > 0),
    connector_type VARCHAR(20) NOT NULL CHECK (connector_type IN ('CCS2', 'Type 2', 'CHAdeMO', 'GB/T')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicle_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_vehicles_user ON vehicles(user_id);

-- ----------------------------------------------------------------------------
-- 3. CHARGING_STATIONS TABLE
-- Physical station hubs located across Bengaluru with geographic coordinates
-- ----------------------------------------------------------------------------
CREATE TABLE charging_stations (
    station_id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL DEFAULT 'Bengaluru',
    pincode VARCHAR(10) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    total_ports INT NOT NULL DEFAULT 4 CHECK (total_ports > 0),
    operational_status VARCHAR(20) NOT NULL DEFAULT 'OPERATIONAL' CHECK (operational_status IN ('OPERATIONAL', 'UNDER_MAINTENANCE', 'CLOSED')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stations_city ON charging_stations(city);

-- ----------------------------------------------------------------------------
-- 4. TARIFFS TABLE
-- Dynamic pricing rules per station with peak-hour surges and idle penalties
-- ----------------------------------------------------------------------------
CREATE TABLE tariffs (
    tariff_id VARCHAR(36) PRIMARY KEY,
    station_id VARCHAR(36) NOT NULL UNIQUE,
    base_rate_per_kwh DECIMAL(6, 2) NOT NULL CHECK (base_rate_per_kwh > 0),
    peak_hour_rate_per_kwh DECIMAL(6, 2) NOT NULL CHECK (peak_hour_rate_per_kwh >= base_rate_per_kwh),
    peak_start_time TIME NOT NULL DEFAULT '17:00:00',
    peak_end_time TIME NOT NULL DEFAULT '22:00:00',
    idle_fee_per_min DECIMAL(5, 2) NOT NULL DEFAULT 2.50 CHECK (idle_fee_per_min >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tariff_station FOREIGN KEY (station_id) REFERENCES charging_stations(station_id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- 5. CHARGERS TABLE
-- Individual charging gun ports belonging to a station
-- State machine: AVAILABLE -> RESERVED -> OCCUPIED -> MAINTENANCE
-- ----------------------------------------------------------------------------
CREATE TABLE chargers (
    charger_id VARCHAR(36) PRIMARY KEY,
    station_id VARCHAR(36) NOT NULL,
    charger_identifier VARCHAR(20) NOT NULL, -- e.g., 'GUN-A1', 'GUN-B2'
    connector_type VARCHAR(20) NOT NULL CHECK (connector_type IN ('CCS2', 'Type 2', 'CHAdeMO', 'GB/T')),
    max_power_kw DECIMAL(5, 1) NOT NULL CHECK (max_power_kw > 0), -- e.g., 22.0, 50.0, 150.0 kW
    current_status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' 
        CHECK (current_status IN ('AVAILABLE', 'RESERVED', 'OCCUPIED', 'UNDER_MAINTENANCE')),
    last_serviced_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_charger_station FOREIGN KEY (station_id) REFERENCES charging_stations(station_id) ON DELETE CASCADE,
    CONSTRAINT uq_station_gun UNIQUE (station_id, charger_identifier)
);

CREATE INDEX idx_chargers_station_status ON chargers(station_id, current_status);

-- ----------------------------------------------------------------------------
-- 6. RESERVATIONS TABLE
-- Concurrency-critical entity storing user bookings for specific time intervals
-- ----------------------------------------------------------------------------
CREATE TABLE reservations (
    reservation_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    vehicle_id VARCHAR(36) NOT NULL,
    charger_id VARCHAR(36) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' 
        CHECK (status IN ('PENDING', 'ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED')),
    estimated_cost DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_reservation_time CHECK (end_time > start_time),
    CONSTRAINT fk_res_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_res_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE RESTRICT,
    CONSTRAINT fk_res_charger FOREIGN KEY (charger_id) REFERENCES chargers(charger_id) ON DELETE RESTRICT
);

-- Compound index for fast temporal overlap collision checking
CREATE INDEX idx_reservations_charger_time ON reservations(charger_id, start_time, end_time, status);

-- ----------------------------------------------------------------------------
-- 7. CHARGING_SESSIONS TABLE
-- Real-time hardware telemetry and transactional billing records
-- ----------------------------------------------------------------------------
CREATE TABLE charging_sessions (
    session_id VARCHAR(36) PRIMARY KEY,
    reservation_id VARCHAR(36) UNIQUE,
    charger_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    vehicle_id VARCHAR(36) NOT NULL,
    actual_start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actual_end_time TIMESTAMP,
    initial_soc INT NOT NULL CHECK (initial_soc BETWEEN 0 AND 100),
    final_soc INT CHECK (final_soc IS NULL OR (final_soc BETWEEN initial_soc AND 100)),
    energy_delivered_kwh DECIMAL(6, 2) NOT NULL DEFAULT 0.00 CHECK (energy_delivered_kwh >= 0.00),
    energy_cost DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    peak_surcharge DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    gst_tax DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_session_res FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id) ON DELETE SET NULL,
    CONSTRAINT fk_session_charger FOREIGN KEY (charger_id) REFERENCES chargers(charger_id) ON DELETE RESTRICT,
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_session_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE RESTRICT
);

CREATE INDEX idx_sessions_user ON charging_sessions(user_id);
CREATE INDEX idx_sessions_charger ON charging_sessions(charger_id);

-- ----------------------------------------------------------------------------
-- 8. USER_REVIEWS TABLE
-- Stores ratings (1 to 5) and feedback on station experience
-- ----------------------------------------------------------------------------
CREATE TABLE user_reviews (
    review_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    station_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_review_station FOREIGN KEY (station_id) REFERENCES charging_stations(station_id) ON DELETE CASCADE
);

CREATE INDEX idx_reviews_station ON user_reviews(station_id);
