-- ============================================================================
-- DBMS Experiential Learning - Level 3 Project
-- Title: VoltReserve - Advanced SQL Queries, Views, CTEs & Window Functions
-- Authors: Namith Kumar Chandrakumar (PES1UG24AM171), Kushal G (PES1UG24AM145)
-- Institution: PES University
-- ============================================================================

-- ============================================================================
-- VIEW 1: Live Station Operational & Availability Dashboard
-- Demonstrates: Multi-table JOINs, Aggregate functions, CASE expressions, GROUP BY
-- ============================================================================
CREATE OR REPLACE VIEW vw_station_live_status AS
SELECT 
    cs.station_id,
    cs.name AS station_name,
    cs.city,
    cs.address,
    t.base_rate_per_kwh,
    t.peak_hour_rate_per_kwh,
    COUNT(c.charger_id) AS total_chargers,
    SUM(CASE WHEN c.current_status = 'AVAILABLE' THEN 1 ELSE 0 END) AS available_chargers,
    SUM(CASE WHEN c.current_status = 'RESERVED' THEN 1 ELSE 0 END) AS reserved_chargers,
    SUM(CASE WHEN c.current_status = 'OCCUPIED' THEN 1 ELSE 0 END) AS occupied_chargers,
    SUM(CASE WHEN c.current_status = 'UNDER_MAINTENANCE' THEN 1 ELSE 0 END) AS maintenance_chargers,
    ROUND(
        (SUM(CASE WHEN c.current_status IN ('RESERVED', 'OCCUPIED') THEN 1.0 ELSE 0.0 END) / 
         NULLIF(COUNT(c.charger_id), 0)) * 100.0, 1
    ) AS current_utilization_pct
FROM charging_stations cs
JOIN tariffs t ON cs.station_id = t.station_id
LEFT JOIN chargers c ON cs.station_id = c.station_id
GROUP BY cs.station_id, cs.name, cs.city, cs.address, t.base_rate_per_kwh, t.peak_hour_rate_per_kwh;

-- ============================================================================
-- VIEW 2: User Charging Lifetime Summary & Vehicle Profile
-- Demonstrates: Multiple JOINs, Aggregates, Null handling
-- ============================================================================
CREATE OR REPLACE VIEW vw_user_billing_history AS
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    v.model AS vehicle_model,
    v.registration_no,
    COUNT(cs.session_id) AS total_sessions_completed,
    COALESCE(SUM(cs.energy_delivered_kwh), 0.0) AS total_kwh_consumed,
    COALESCE(SUM(cs.total_amount), 0.0) AS total_money_spent_inr,
    COALESCE(ROUND(AVG(cs.energy_delivered_kwh), 2), 0.0) AS avg_kwh_per_session
FROM users u
JOIN vehicles v ON u.user_id = v.user_id
LEFT JOIN charging_sessions cs ON u.user_id = cs.user_id AND cs.payment_status = 'PAID'
GROUP BY u.user_id, u.full_name, u.email, v.model, v.registration_no;

-- ============================================================================
-- QUERY 1: Hourly Peak Load Analysis using CTE (Common Table Expression)
-- Concept: CTE with Aggregate and Ordering to find peak hours of the day
-- ============================================================================
WITH HourlyReservations AS (
    SELECT 
        EXTRACT(HOUR FROM start_time) AS reservation_hour,
        COUNT(*) AS booking_count,
        SUM(estimated_cost) AS total_projected_revenue
    FROM reservations
    WHERE status != 'CANCELLED'
    GROUP BY EXTRACT(HOUR FROM start_time)
)
SELECT 
    reservation_hour,
    booking_count,
    total_projected_revenue,
    CASE 
        WHEN booking_count >= 3 THEN 'HIGH_PEAK'
        WHEN booking_count BETWEEN 1 AND 2 THEN 'MODERATE'
        ELSE 'LOW_DEMAND'
    END AS traffic_classification
FROM HourlyReservations
ORDER BY booking_count DESC, reservation_hour ASC;

-- ============================================================================
-- QUERY 2: Station Revenue Ranking using Window Function DENSE_RANK()
-- Concept: Analytical Window Functions (OVER, PARTITION BY, DENSE_RANK)
-- ============================================================================
SELECT 
    cs.name AS station_name,
    cs.city,
    COUNT(csess.session_id) AS sessions_handled,
    COALESCE(SUM(csess.total_amount), 0.0) AS total_revenue_inr,
    DENSE_RANK() OVER (
        PARTITION BY cs.city 
        ORDER BY COALESCE(SUM(csess.total_amount), 0.0) DESC
    ) AS city_revenue_rank,
    ROUND(AVG(COALESCE(csess.total_amount, 0.0)) OVER (PARTITION BY cs.city), 2) AS city_avg_station_revenue
FROM charging_stations cs
JOIN chargers c ON cs.station_id = c.station_id
LEFT JOIN charging_sessions csess ON c.charger_id = csess.charger_id
GROUP BY cs.station_id, cs.name, cs.city;

-- ============================================================================
-- QUERY 3: Moving Average of Energy Delivery using Sliding Window Frame
-- Concept: Window frame specification (ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)
-- ============================================================================
SELECT 
    session_id,
    charger_id,
    actual_start_time,
    energy_delivered_kwh,
    ROUND(
        AVG(energy_delivered_kwh) OVER (
            ORDER BY actual_start_time
            ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
        ), 2
    ) AS rolling_3_session_avg_kwh
FROM charging_sessions
WHERE payment_status = 'PAID'
ORDER BY actual_start_time ASC;

-- ============================================================================
-- QUERY 4: Correlated Subquery with HAVING Clause
-- Concept: Identify chargers whose total delivered energy exceeds the station's average charger output
-- ============================================================================
SELECT 
    c.charger_id,
    c.charger_identifier,
    cs.name AS station_name,
    SUM(sess.energy_delivered_kwh) AS total_charger_kwh
FROM chargers c
JOIN charging_stations cs ON c.station_id = cs.station_id
JOIN charging_sessions sess ON c.charger_id = sess.charger_id
GROUP BY c.charger_id, c.charger_identifier, cs.station_id, cs.name
HAVING SUM(sess.energy_delivered_kwh) > (
    -- Correlated Subquery: average energy per charger for this specific station
    SELECT AVG(charger_total_kwh)
    FROM (
        SELECT SUM(s2.energy_delivered_kwh) AS charger_total_kwh
        FROM chargers c2
        JOIN charging_sessions s2 ON c2.charger_id = s2.charger_id
        WHERE c2.station_id = cs.station_id
        GROUP BY c2.charger_id
    ) AS station_averages
)
ORDER BY total_charger_kwh DESC;

-- ============================================================================
-- QUERY 5: Nested Subquery to find top eco-friendly EV Drivers
-- Concept: Subquery in WHERE clause with IN and aggregate comparison
-- ============================================================================
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    v.make,
    v.model
FROM users u
JOIN vehicles v ON u.user_id = v.user_id
WHERE u.user_id IN (
    SELECT user_id
    FROM charging_sessions
    GROUP BY user_id
    HAVING SUM(energy_delivered_kwh) >= 50.0
);
