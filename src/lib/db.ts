import { 
  User, Vehicle, ChargingStation, Tariff, Charger, 
  Reservation, ChargingSession, UserReview 
} from '@/types';

// In-Memory Database Store with preloaded sample data matching seed.sql
interface DBState {
  users: User[];
  vehicles: Vehicle[];
  stations: ChargingStation[];
  tariffs: Tariff[];
  chargers: Charger[];
  reservations: Reservation[];
  sessions: ChargingSession[];
  reviews: UserReview[];
}

// Global persistence in Node.js runtime
declare global {
  // eslint-disable-next-line no-var
  var __VOLTRESERVE_DB__: DBState | undefined;
}

function initializeDatabase(): DBState {
  return {
    users: [
      {
        user_id: 'usr_001',
        full_name: 'Namith Kumar Chandrakumar',
        email: 'namith@ev.com',
        role: 'CUSTOMER',
        phone_number: '+91 98450 11223',
        wallet_balance: 1450.00,
        created_at: '2026-10-25 09:00:00'
      },
      {
        user_id: 'usr_002',
        full_name: 'Kushal G',
        email: 'kushal@ev.com',
        role: 'CUSTOMER',
        phone_number: '+91 98450 44556',
        wallet_balance: 2200.00,
        created_at: '2026-10-25 10:15:00'
      },
      {
        user_id: 'usr_admin',
        full_name: 'Station Network Administrator',
        email: 'admin@ev.com',
        role: 'ADMIN',
        phone_number: '+91 80 2345 6789',
        wallet_balance: 50000.00,
        created_at: '2026-10-20 08:00:00'
      }
    ],
    vehicles: [
      {
        vehicle_id: 'veh_001',
        user_id: 'usr_001',
        make: 'Tata',
        model: 'Nexon EV Empowered',
        registration_no: 'KA-01-MJ-4040',
        battery_capacity_kwh: 40.5,
        connector_type: 'CCS2'
      },
      {
        vehicle_id: 'veh_002',
        user_id: 'usr_002',
        make: 'MG',
        model: 'ZS EV Exclusive',
        registration_no: 'KA-03-NB-8899',
        battery_capacity_kwh: 50.3,
        connector_type: 'CCS2'
      }
    ],
    stations: [
      {
        station_id: 'stn_001',
        name: 'Indiranagar 100ft Hub',
        address: '100 Feet Road, HAL 2nd Stage, Indiranagar',
        city: 'Bengaluru',
        pincode: '560038',
        latitude: 12.971891,
        longitude: 77.641154,
        total_ports: 4,
        operational_status: 'OPERATIONAL'
      },
      {
        station_id: 'stn_002',
        name: 'Koramangala Sony Signal Plaza',
        address: '80 Feet Road, 4th Block, Koramangala',
        city: 'Bengaluru',
        pincode: '560034',
        latitude: 12.935193,
        longitude: 77.624481,
        total_ports: 4,
        operational_status: 'OPERATIONAL'
      },
      {
        station_id: 'stn_003',
        name: 'Whitefield ITPL TechPark',
        address: 'Pattandur Agrahara, Whitefield',
        city: 'Bengaluru',
        pincode: '560066',
        latitude: 12.986872,
        longitude: 77.738197,
        total_ports: 4,
        operational_status: 'OPERATIONAL'
      },
      {
        station_id: 'stn_004',
        name: 'Electronic City Phase 1 E-Hub',
        address: 'Hosur Road, Near Toll Plaza, Electronic City',
        city: 'Bengaluru',
        pincode: '560100',
        latitude: 12.845214,
        longitude: 77.660168,
        total_ports: 4,
        operational_status: 'OPERATIONAL'
      },
      {
        station_id: 'stn_005',
        name: 'MG Road Metro Supercharge',
        address: 'MG Road, Central Business District',
        city: 'Bengaluru',
        pincode: '560001',
        latitude: 12.975618,
        longitude: 77.606628,
        total_ports: 4,
        operational_status: 'OPERATIONAL'
      }
    ],
    tariffs: [
      {
        tariff_id: 'trf_001',
        station_id: 'stn_001',
        base_rate_per_kwh: 16.50,
        peak_hour_rate_per_kwh: 22.00,
        peak_start_time: '17:00:00',
        peak_end_time: '22:00:00',
        idle_fee_per_min: 2.00,
        currency: 'INR'
      },
      {
        tariff_id: 'trf_002',
        station_id: 'stn_002',
        base_rate_per_kwh: 17.00,
        peak_hour_rate_per_kwh: 23.50,
        peak_start_time: '17:00:00',
        peak_end_time: '22:00:00',
        idle_fee_per_min: 2.50,
        currency: 'INR'
      },
      {
        tariff_id: 'trf_003',
        station_id: 'stn_003',
        base_rate_per_kwh: 15.00,
        peak_hour_rate_per_kwh: 20.00,
        peak_start_time: '18:00:00',
        peak_end_time: '23:00:00',
        idle_fee_per_min: 1.50,
        currency: 'INR'
      },
      {
        tariff_id: 'trf_004',
        station_id: 'stn_004',
        base_rate_per_kwh: 14.50,
        peak_hour_rate_per_kwh: 19.00,
        peak_start_time: '17:00:00',
        peak_end_time: '21:00:00',
        idle_fee_per_min: 1.50,
        currency: 'INR'
      },
      {
        tariff_id: 'trf_005',
        station_id: 'stn_005',
        base_rate_per_kwh: 18.00,
        peak_hour_rate_per_kwh: 25.00,
        peak_start_time: '16:00:00',
        peak_end_time: '22:00:00',
        idle_fee_per_min: 3.00,
        currency: 'INR'
      }
    ],
    chargers: [
      { charger_id: 'chg_101', station_id: 'stn_001', charger_identifier: 'GUN-1A (DC Fast)', connector_type: 'CCS2', max_power_kw: 60, current_status: 'AVAILABLE' },
      { charger_id: 'chg_102', station_id: 'stn_001', charger_identifier: 'GUN-1B (DC Fast)', connector_type: 'CCS2', max_power_kw: 60, current_status: 'AVAILABLE' },
      { charger_id: 'chg_103', station_id: 'stn_001', charger_identifier: 'GUN-2A (Ultra DC)', connector_type: 'CCS2', max_power_kw: 150, current_status: 'AVAILABLE' },
      { charger_id: 'chg_104', station_id: 'stn_001', charger_identifier: 'GUN-3A (AC Slow)', connector_type: 'Type 2', max_power_kw: 22, current_status: 'AVAILABLE' },

      { charger_id: 'chg_201', station_id: 'stn_002', charger_identifier: 'GUN-1A (DC Fast)', connector_type: 'CCS2', max_power_kw: 50, current_status: 'AVAILABLE' },
      { charger_id: 'chg_202', station_id: 'stn_002', charger_identifier: 'GUN-1B (DC Fast)', connector_type: 'CCS2', max_power_kw: 50, current_status: 'AVAILABLE' },
      { charger_id: 'chg_203', station_id: 'stn_002', charger_identifier: 'GUN-2A (Hyper DC)', connector_type: 'CCS2', max_power_kw: 120, current_status: 'AVAILABLE' },
      { charger_id: 'chg_204', station_id: 'stn_002', charger_identifier: 'GUN-3A (AC Slow)', connector_type: 'Type 2', max_power_kw: 22, current_status: 'UNDER_MAINTENANCE' },

      { charger_id: 'chg_301', station_id: 'stn_003', charger_identifier: 'GUN-1A (DC Fast)', connector_type: 'CCS2', max_power_kw: 60, current_status: 'AVAILABLE' },
      { charger_id: 'chg_302', station_id: 'stn_003', charger_identifier: 'GUN-1B (DC Fast)', connector_type: 'CCS2', max_power_kw: 60, current_status: 'AVAILABLE' },
      { charger_id: 'chg_303', station_id: 'stn_003', charger_identifier: 'GUN-2A (Ultra DC)', connector_type: 'CCS2', max_power_kw: 150, current_status: 'AVAILABLE' },
      { charger_id: 'chg_304', station_id: 'stn_003', charger_identifier: 'GUN-3A (Type 2)', connector_type: 'Type 2', max_power_kw: 22, current_status: 'AVAILABLE' },

      { charger_id: 'chg_401', station_id: 'stn_004', charger_identifier: 'GUN-1A (DC Fast)', connector_type: 'CCS2', max_power_kw: 60, current_status: 'AVAILABLE' },
      { charger_id: 'chg_402', station_id: 'stn_004', charger_identifier: 'GUN-2A (DC Fast)', connector_type: 'CCS2', max_power_kw: 60, current_status: 'AVAILABLE' },
      { charger_id: 'chg_403', station_id: 'stn_004', charger_identifier: 'GUN-3A (Type 2)', connector_type: 'Type 2', max_power_kw: 22, current_status: 'AVAILABLE' },
      { charger_id: 'chg_404', station_id: 'stn_004', charger_identifier: 'GUN-4A (CHAdeMO)', connector_type: 'CHAdeMO', max_power_kw: 50, current_status: 'AVAILABLE' },

      { charger_id: 'chg_501', station_id: 'stn_005', charger_identifier: 'GUN-1A (Ultra DC)', connector_type: 'CCS2', max_power_kw: 150, current_status: 'AVAILABLE' },
      { charger_id: 'chg_502', station_id: 'stn_005', charger_identifier: 'GUN-1B (Ultra DC)', connector_type: 'CCS2', max_power_kw: 150, current_status: 'AVAILABLE' },
      { charger_id: 'chg_503', station_id: 'stn_005', charger_identifier: 'GUN-2A (DC Fast)', connector_type: 'CCS2', max_power_kw: 60, current_status: 'AVAILABLE' },
      { charger_id: 'chg_504', station_id: 'stn_005', charger_identifier: 'GUN-3A (AC Slow)', connector_type: 'Type 2', max_power_kw: 22, current_status: 'AVAILABLE' }
    ],
    reservations: [
      {
        reservation_id: 'res_001',
        user_id: 'usr_001',
        vehicle_id: 'veh_001',
        charger_id: 'chg_101',
        start_time: '2026-10-28 10:00:00',
        end_time: '2026-10-28 11:00:00',
        status: 'COMPLETED',
        estimated_cost: 495.00,
        created_at: '2026-10-28 08:30:00'
      },
      {
        reservation_id: 'res_002',
        user_id: 'usr_002',
        vehicle_id: 'veh_002',
        charger_id: 'chg_201',
        start_time: '2026-10-28 14:00:00',
        end_time: '2026-10-28 15:00:00',
        status: 'ACTIVE',
        estimated_cost: 510.00,
        created_at: '2026-10-28 09:15:00'
      }
    ],
    sessions: [
      {
        session_id: 'sess_001',
        reservation_id: 'res_001',
        charger_id: 'chg_101',
        user_id: 'usr_001',
        vehicle_id: 'veh_001',
        actual_start_time: '2026-10-28 10:02:00',
        actual_end_time: '2026-10-28 10:58:00',
        initial_soc: 22,
        final_soc: 85,
        energy_delivered_kwh: 25.50,
        energy_cost: 420.75,
        peak_surcharge: 0.00,
        gst_tax: 75.74,
        total_amount: 496.49,
        payment_status: 'PAID'
      }
    ],
    reviews: [
      {
        review_id: 'rev_001',
        user_id: 'usr_001',
        station_id: 'stn_001',
        rating: 5,
        comment: 'Super fast 60kW charging, got my Nexon from 20% to 80% in 45 mins. Clean bay and shade!',
        created_at: '2026-10-28 11:10:00',
        user_name: 'Namith Kumar'
      },
      {
        review_id: 'rev_002',
        user_id: 'usr_002',
        station_id: 'stn_002',
        rating: 4,
        comment: 'Very accessible near Sony Signal, coffee shop next door is great while waiting.',
        created_at: '2026-10-27 16:30:00',
        user_name: 'Kushal G'
      }
    ]
  };
}

export function getDB(): DBState {
  if (!global.__VOLTRESERVE_DB__) {
    global.__VOLTRESERVE_DB__ = initializeDatabase();
  }
  return global.__VOLTRESERVE_DB__;
}

// ----------------------------------------------------------------------------
// RELATIONAL DATA ACCESS METHODS
// ----------------------------------------------------------------------------

export function getStations() {
  const db = getDB();
  return db.stations.map(station => {
    const tariff = db.tariffs.find(t => t.station_id === station.station_id);
    const stationChargers = db.chargers.filter(c => c.station_id === station.station_id);
    const availableCount = stationChargers.filter(c => c.current_status === 'AVAILABLE').length;

    return {
      ...station,
      tariff,
      chargers: stationChargers,
      available_chargers: availableCount
    };
  });
}

export function getStationById(stationId: string) {
  const stations = getStations();
  return stations.find(s => s.station_id === stationId);
}

export function getChargers(stationId?: string) {
  const db = getDB();
  if (stationId) {
    return db.chargers.filter(c => c.station_id === stationId);
  }
  return db.chargers;
}

export function updateChargerStatus(chargerId: string, status: Charger['current_status']) {
  const db = getDB();
  const charger = db.chargers.find(c => c.charger_id === chargerId);
  if (!charger) throw new Error('Charger not found');
  charger.current_status = status;
  return charger;
}

// ----------------------------------------------------------------------------
// CONCURRENCY-SAFE SLOT RESERVATION (TRANSACTION SIMULATION)
// ----------------------------------------------------------------------------
export function createReservationAtomic(params: {
  userId: string;
  vehicleId: string;
  chargerId: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
}) {
  const db = getDB();
  const { userId, vehicleId, chargerId, startTime, endTime } = params;

  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (isNaN(start) || isNaN(end) || end <= start) {
    throw new Error('Invalid booking duration: End time must be after start time.');
  }

  // 1. Concurrency Check: Check for overlapping active reservations on the same charger
  // (StartA < EndB) and (EndA > StartB)
  const hasConflict = db.reservations.some(r => {
    if (r.charger_id !== chargerId) return false;
    if (r.status !== 'ACTIVE' && r.status !== 'PENDING' && r.status !== 'IN_PROGRESS') return false;

    const rStart = new Date(r.start_time).getTime();
    const rEnd = new Date(r.end_time).getTime();
    return (start < rEnd) && (end > rStart);
  });

  if (hasConflict) {
    throw new Error('Slot collision: Charger is already reserved for the chosen time window.');
  }

  // 2. Check charger status
  const charger = db.chargers.find(c => c.charger_id === chargerId);
  if (!charger) throw new Error('Charger does not exist.');
  if (charger.current_status === 'UNDER_MAINTENANCE') {
    throw new Error('Charger is currently under maintenance.');
  }

  // 3. Compute estimated cost
  const station = db.stations.find(s => s.station_id === charger.station_id);
  const tariff = db.tariffs.find(t => t.station_id === station?.station_id);
  const durationHours = (end - start) / (1000 * 60 * 60);
  const baseRate = tariff ? tariff.base_rate_per_kwh : 16.00;
  const estimatedKwh = Math.min(charger.max_power_kw, 50) * durationHours * 0.8;
  const estimatedCost = Math.round(estimatedKwh * baseRate * 100) / 100;

  // 4. Create reservation
  const newReservation: Reservation = {
    reservation_id: `res_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    user_id: userId,
    vehicle_id: vehicleId,
    charger_id: chargerId,
    start_time: new Date(start).toISOString().replace('T', ' ').substring(0, 19),
    end_time: new Date(end).toISOString().replace('T', ' ').substring(0, 19),
    status: 'ACTIVE',
    estimated_cost: estimatedCost,
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  db.reservations.unshift(newReservation);

  // TRIGGER SIMULATION: If slot starts within 15 minutes, mark charger as RESERVED
  const now = Date.now();
  if (start <= now + 15 * 60 * 1000 && end > now) {
    charger.current_status = 'RESERVED';
  }

  return newReservation;
}

export function cancelReservation(reservationId: string) {
  const db = getDB();
  const res = db.reservations.find(r => r.reservation_id === reservationId);
  if (!res) throw new Error('Reservation not found');
  res.status = 'CANCELLED';

  // TRIGGER SIMULATION: Restore charger to AVAILABLE if currently RESERVED
  const charger = db.chargers.find(c => c.charger_id === res.charger_id);
  if (charger && charger.current_status === 'RESERVED') {
    charger.current_status = 'AVAILABLE';
  }

  return res;
}

// ----------------------------------------------------------------------------
// CHARGING SESSION STATE MACHINE & BILLING PROCEDURES
// ----------------------------------------------------------------------------
export function startChargingSession(params: {
  reservationId?: string;
  chargerId: string;
  userId: string;
  vehicleId: string;
  initialSoc: number;
}) {
  const db = getDB();
  const { reservationId, chargerId, userId, vehicleId, initialSoc } = params;

  // Find charger
  const charger = db.chargers.find(c => c.charger_id === chargerId);
  if (!charger) throw new Error('Charger not found');

  // TRIGGER SIMULATION: State transition to OCCUPIED
  charger.current_status = 'OCCUPIED';

  if (reservationId) {
    const res = db.reservations.find(r => r.reservation_id === reservationId);
    if (res) res.status = 'IN_PROGRESS';
  }

  const session: ChargingSession = {
    session_id: `sess_${Date.now()}`,
    reservation_id: reservationId || null,
    charger_id: chargerId,
    user_id: userId,
    vehicle_id: vehicleId,
    actual_start_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
    actual_end_time: null,
    initial_soc: initialSoc,
    final_soc: null,
    energy_delivered_kwh: 0,
    energy_cost: 0,
    peak_surcharge: 0,
    gst_tax: 0,
    total_amount: 0,
    payment_status: 'PENDING'
  };

  db.sessions.unshift(session);
  return session;
}

export function completeChargingSession(params: {
  sessionId: string;
  finalSoc: number;
  energyDeliveredKwh: number;
}) {
  const db = getDB();
  const { sessionId, finalSoc, energyDeliveredKwh } = params;

  const session = db.sessions.find(s => s.session_id === sessionId);
  if (!session) throw new Error('Session not found');

  const charger = db.chargers.find(c => c.charger_id === session.charger_id);
  const station = db.stations.find(s => s.station_id === charger?.station_id);
  const tariff = db.tariffs.find(t => t.station_id === station?.station_id);

  const baseRate = tariff?.base_rate_per_kwh || 16.0;
  const peakRate = tariff?.peak_hour_rate_per_kwh || 22.0;

  // Check if current hour is in peak hours (17:00 to 22:00)
  const currentHour = new Date().getHours();
  const isPeak = currentHour >= 17 && currentHour <= 22;

  const energyCost = Math.round(energyDeliveredKwh * baseRate * 100) / 100;
  const peakSurcharge = isPeak ? Math.round((peakRate - baseRate) * energyDeliveredKwh * 100) / 100 : 0.00;
  const gstTax = Math.round((energyCost + peakSurcharge) * 0.18 * 100) / 100;
  const totalAmount = Math.round((energyCost + peakSurcharge + gstTax) * 100) / 100;

  session.actual_end_time = new Date().toISOString().replace('T', ' ').substring(0, 19);
  session.final_soc = finalSoc;
  session.energy_delivered_kwh = energyDeliveredKwh;
  session.energy_cost = energyCost;
  session.peak_surcharge = peakSurcharge;
  session.gst_tax = gstTax;
  session.total_amount = totalAmount;
  session.payment_status = 'PAID';

  // Mark reservation as COMPLETED
  if (session.reservation_id) {
    const res = db.reservations.find(r => r.reservation_id === session.reservation_id);
    if (res) res.status = 'COMPLETED';
  }

  // TRIGGER SIMULATION: Charger state transitions back to AVAILABLE
  if (charger) {
    charger.current_status = 'AVAILABLE';
  }

  // Deduct from user wallet balance
  const user = db.users.find(u => u.user_id === session.user_id);
  if (user) {
    user.wallet_balance = Math.max(0, Math.round((user.wallet_balance - totalAmount) * 100) / 100);
  }

  return session;
}

// ----------------------------------------------------------------------------
// ADVANCED SQL ANALYTICS (CTEs, Window Functions, Aggregate Queries)
// ----------------------------------------------------------------------------
export function getAnalytics() {
  const db = getDB();

  // 1. Peak Hour Analysis using CTE logic
  const hourCounts: { [hour: number]: { count: number; revenue: number } } = {};
  for (let h = 6; h <= 23; h++) {
    hourCounts[h] = { count: 0, revenue: 0 };
  }

  db.reservations.forEach(r => {
    const d = new Date(r.start_time);
    const hour = d.getHours();
    if (hourCounts[hour]) {
      hourCounts[hour].count += 1;
      hourCounts[hour].revenue += r.estimated_cost;
    }
  });

  const peakHoursCTE = Object.entries(hourCounts).map(([hour, data]) => {
    const h = parseInt(hour);
    return {
      hourLabel: `${h.toString().padStart(2, '0')}:00`,
      bookings: data.count,
      revenue: data.revenue,
      demandLevel: data.count >= 2 ? 'HIGH_PEAK' : data.count === 1 ? 'MODERATE' : 'NORMAL'
    };
  });

  // 2. Station Revenue Ranking using Window Function DENSE_RANK() logic
  const stationRevenueMap = db.stations.map(station => {
    const stationChargerIds = db.chargers.filter(c => c.station_id === station.station_id).map(c => c.charger_id);
    const stationSessions = db.sessions.filter(s => stationChargerIds.includes(s.charger_id));
    const totalRev = stationSessions.reduce((acc, curr) => acc + curr.total_amount, 0);
    const totalKwh = stationSessions.reduce((acc, curr) => acc + curr.energy_delivered_kwh, 0);

    return {
      station_id: station.station_id,
      name: station.name,
      city: station.city,
      sessions_count: stationSessions.length,
      total_revenue: totalRev,
      total_kwh: totalKwh
    };
  });

  stationRevenueMap.sort((a, b) => b.total_revenue - a.total_revenue);

  let currentRank = 1;
  const stationRankings = stationRevenueMap.map((item, idx, arr) => {
    if (idx > 0 && item.total_revenue < arr[idx - 1].total_revenue) {
      currentRank = idx + 1;
    }
    return {
      ...item,
      dense_rank: currentRank
    };
  });

  // 3. Charger State Distribution View
  const statusCounts = {
    available: db.chargers.filter(c => c.current_status === 'AVAILABLE').length,
    reserved: db.chargers.filter(c => c.current_status === 'RESERVED').length,
    occupied: db.chargers.filter(c => c.current_status === 'OCCUPIED').length,
    maintenance: db.chargers.filter(c => c.current_status === 'UNDER_MAINTENANCE').length,
    total: db.chargers.length
  };

  return {
    peakHoursCTE,
    stationRankings,
    statusCounts,
    totalEnergyDeliveredKwh: db.sessions.reduce((acc, s) => acc + s.energy_delivered_kwh, 0),
    totalRevenueInr: db.sessions.reduce((acc, s) => acc + s.total_amount, 0),
    activeReservationsCount: db.reservations.filter(r => r.status === 'ACTIVE').length
  };
}

// ----------------------------------------------------------------------------
// NoSQL (MongoDB) Aggregation Pipeline Simulation
// ----------------------------------------------------------------------------
export function getNoSqlTelemetryAggregation() {
  return [
    {
      charger_id: 'chg_101',
      station_name: 'Indiranagar 100ft Hub',
      avg_power_kw: 58.4,
      max_power_kw: 61.2,
      max_battery_temp_celsius: 38.5,
      overheating_events: 0,
      health_status: 'HEALTHY',
      telemetry_ticks: 1420
    },
    {
      charger_id: 'chg_103',
      station_name: 'Indiranagar 100ft Hub',
      avg_power_kw: 142.1,
      max_power_kw: 152.0,
      max_battery_temp_celsius: 44.8,
      overheating_events: 2,
      health_status: 'THERMAL_WARNING',
      telemetry_ticks: 980
    },
    {
      charger_id: 'chg_201',
      station_name: 'Koramangala Sony Signal Plaza',
      avg_power_kw: 48.9,
      max_power_kw: 50.0,
      max_battery_temp_celsius: 36.1,
      overheating_events: 0,
      health_status: 'HEALTHY',
      telemetry_ticks: 2150
    },
    {
      charger_id: 'chg_501',
      station_name: 'MG Road Metro Supercharge',
      avg_power_kw: 139.7,
      max_power_kw: 149.5,
      max_battery_temp_celsius: 41.2,
      overheating_events: 0,
      health_status: 'HEALTHY',
      telemetry_ticks: 1840
    }
  ];
}
