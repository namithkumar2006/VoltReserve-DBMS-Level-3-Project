-- ============================================================================
-- DBMS Experiential Learning - Level 3 Project
-- Title: VoltReserve - Advanced SQL Triggers, Functions & Stored Procedures
-- Authors: Namith Kumar Chandrakumar (PES1UG24AM171), Kushal G (PES1UG24AM145)
-- Institution: PES University
-- ============================================================================

-- ============================================================================
-- 1. STORED PROCEDURE: Atomic Overlap-Free Slot Reservation
-- Demonstrates: Concurrency Control, Row-Level Locking, ACID Transactions
-- ============================================================================
CREATE OR REPLACE PROCEDURE sp_create_reservation_atomic(
    IN p_user_id VARCHAR(36),
    IN p_vehicle_id VARCHAR(36),
    IN p_charger_id VARCHAR(36),
    IN p_start_time TIMESTAMP,
    IN p_end_time TIMESTAMP,
    OUT p_reservation_id VARCHAR(36),
    OUT p_status_code VARCHAR(20),
    OUT p_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_overlap_count INT := 0;
    v_charger_status VARCHAR(20);
    v_base_rate DECIMAL(6,2);
    v_hours_duration NUMERIC;
    v_estimated_cost DECIMAL(8,2);
    v_new_res_id VARCHAR(36);
BEGIN
    -- Input validation
    IF p_end_time <= p_start_time THEN
        p_status_code := 'INVALID_TIME';
        p_message := 'End time must be strictly after start time.';
        RETURN;
    END IF;

    -- Concurrency Control: Acquire exclusive row lock on target charger
    SELECT current_status INTO v_charger_status
    FROM chargers
    WHERE charger_id = p_charger_id
    FOR UPDATE;

    IF v_charger_status = 'UNDER_MAINTENANCE' THEN
        p_status_code := 'MAINTENANCE';
        p_message := 'Charger is currently under maintenance.';
        RETURN;
    END IF;

    -- Check for temporal collision with existing active reservations
    -- Overlap condition: (StartA < EndB) AND (EndA > StartB)
    SELECT COUNT(*) INTO v_overlap_count
    FROM reservations
    WHERE charger_id = p_charger_id
      AND status IN ('PENDING', 'ACTIVE', 'IN_PROGRESS')
      AND (start_time < p_end_time AND end_time > p_start_time);

    IF v_overlap_count > 0 THEN
        p_status_code := 'SLOT_COLLISION';
        p_message := 'The selected time slot overlaps with an existing reservation.';
        RETURN;
    END IF;

    -- Calculate estimated cost based on station tariff
    SELECT t.base_rate_per_kwh INTO v_base_rate
    FROM tariffs t
    JOIN chargers c ON t.station_id = c.station_id
    WHERE c.charger_id = p_charger_id;

    v_hours_duration := EXTRACT(EPOCH FROM (p_end_time - p_start_time)) / 3600.0;
    v_estimated_cost := ROUND(v_hours_duration * 30.0 * COALESCE(v_base_rate, 15.0), 2);

    -- Generate UUID for reservation
    v_new_res_id := md5(random()::text || clock_timestamp()::text);

    -- Atomically insert the reservation
    INSERT INTO reservations (reservation_id, user_id, vehicle_id, charger_id, start_time, end_time, status, estimated_cost)
    VALUES (v_new_res_id, p_user_id, p_vehicle_id, p_charger_id, p_start_time, p_end_time, 'ACTIVE', v_estimated_cost);

    -- Update charger state to RESERVED if booking is starting right now
    IF p_start_time <= CURRENT_TIMESTAMP AND p_end_time > CURRENT_TIMESTAMP THEN
        UPDATE chargers SET current_status = 'RESERVED' WHERE charger_id = p_charger_id;
    END IF;

    p_reservation_id := v_new_res_id;
    p_status_code := 'SUCCESS';
    p_message := 'Reservation confirmed successfully.';
END;
$$;

-- ============================================================================
-- 2. STORED PROCEDURE: Complete Charging Session & Billing
-- Demonstrates: Complex business logic, tariff computation, wallet transaction
-- ============================================================================
CREATE OR REPLACE PROCEDURE sp_complete_charging_session(
    IN p_session_id VARCHAR(36),
    IN p_final_soc INT,
    IN p_energy_delivered_kwh DECIMAL(6,2),
    OUT p_total_amount DECIMAL(8,2),
    OUT p_status_code VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_charger_id VARCHAR(36);
    v_user_id VARCHAR(36);
    v_res_id VARCHAR(36);
    v_base_rate DECIMAL(6,2);
    v_peak_rate DECIMAL(6,2);
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP := CURRENT_TIMESTAMP;
    v_is_peak BOOLEAN;
    v_applied_rate DECIMAL(6,2);
    v_energy_cost DECIMAL(8,2);
    v_peak_surcharge DECIMAL(8,2) := 0.00;
    v_gst_tax DECIMAL(8,2);
    v_final_bill DECIMAL(8,2);
BEGIN
    -- Fetch session details
    SELECT charger_id, user_id, reservation_id, actual_start_time
    INTO v_charger_id, v_user_id, v_res_id, v_start_time
    FROM charging_sessions
    WHERE session_id = p_session_id;

    IF v_charger_id IS NULL THEN
        p_status_code := 'SESSION_NOT_FOUND';
        RETURN;
    END IF;

    -- Fetch Station Tariff
    SELECT t.base_rate_per_kwh, t.peak_hour_rate_per_kwh
    INTO v_base_rate, v_peak_rate
    FROM tariffs t
    JOIN chargers c ON t.station_id = c.station_id
    WHERE c.charger_id = v_charger_id;

    -- Peak hour logic (17:00 to 22:00)
    IF EXTRACT(HOUR FROM v_end_time) BETWEEN 17 AND 22 THEN
        v_applied_rate := v_peak_rate;
        v_peak_surcharge := ROUND((v_peak_rate - v_base_rate) * p_energy_delivered_kwh, 2);
    ELSE
        v_applied_rate := v_base_rate;
    END IF;

    v_energy_cost := ROUND(p_energy_delivered_kwh * v_base_rate, 2);
    v_gst_tax := ROUND((v_energy_cost + v_peak_surcharge) * 0.18, 2); -- 18% GST
    v_final_bill := v_energy_cost + v_peak_surcharge + v_gst_tax;

    -- Update session record
    UPDATE charging_sessions
    SET actual_end_time = v_end_time,
        final_soc = p_final_soc,
        energy_delivered_kwh = p_energy_delivered_kwh,
        energy_cost = v_energy_cost,
        peak_surcharge = v_peak_surcharge,
        gst_tax = v_gst_tax,
        total_amount = v_final_bill,
        payment_status = 'PAID'
    WHERE session_id = p_session_id;

    -- Mark associated reservation as COMPLETED
    IF v_res_id IS NOT NULL THEN
        UPDATE reservations SET status = 'COMPLETED' WHERE reservation_id = v_res_id;
    END IF;

    -- Return charger to AVAILABLE
    UPDATE chargers SET current_status = 'AVAILABLE' WHERE charger_id = v_charger_id;

    -- Deduct from user wallet balance
    UPDATE users SET wallet_balance = GREATEST(0.00, wallet_balance - v_final_bill) WHERE user_id = v_user_id;

    p_total_amount := v_final_bill;
    p_status_code := 'SUCCESS';
END;
$$;

-- ============================================================================
-- 3. TRIGGER 1: Database-Level Guard against Overlapping Reservations
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_check_reservation_overlap()
RETURNS TRIGGER AS $$
DECLARE
    v_conflict_count INT;
BEGIN
    SELECT COUNT(*) INTO v_conflict_count
    FROM reservations
    WHERE charger_id = NEW.charger_id
      AND status IN ('PENDING', 'ACTIVE', 'IN_PROGRESS')
      AND reservation_id != COALESCE(NEW.reservation_id, 'NEW_RECORD')
      AND (start_time < NEW.end_time AND end_time > NEW.start_time);

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'Database Integrity Constraint: Slot collision detected on charger % for interval [% to %].',
            NEW.charger_id, NEW.start_time, NEW.end_time;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_reservation_overlap
BEFORE INSERT OR UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION fn_check_reservation_overlap();

-- ============================================================================
-- 4. TRIGGER 2: Automatic Charger State Transition to OCCUPIED on Session Start
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_on_session_start()
RETURNS TRIGGER AS $$
BEGIN
    -- Transition charger status to OCCUPIED
    UPDATE chargers
    SET current_status = 'OCCUPIED'
    WHERE charger_id = NEW.charger_id;

    -- Update linked reservation to IN_PROGRESS
    IF NEW.reservation_id IS NOT NULL THEN
        UPDATE reservations
        SET status = 'IN_PROGRESS'
        WHERE reservation_id = NEW.reservation_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_on_session_start
AFTER INSERT ON charging_sessions
FOR EACH ROW
EXECUTE FUNCTION fn_on_session_start();

-- ============================================================================
-- 5. TRIGGER 3: Automatic Charger State Transition to AVAILABLE on Cancel
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_on_reservation_cancelled()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('CANCELLED', 'EXPIRED') AND OLD.status IN ('PENDING', 'ACTIVE') THEN
        -- Only set back to AVAILABLE if charger is currently RESERVED
        UPDATE chargers
        SET current_status = 'AVAILABLE'
        WHERE charger_id = NEW.charger_id AND current_status = 'RESERVED';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_on_reservation_cancelled
AFTER UPDATE OF status ON reservations
FOR EACH ROW
EXECUTE FUNCTION fn_on_reservation_cancelled();
