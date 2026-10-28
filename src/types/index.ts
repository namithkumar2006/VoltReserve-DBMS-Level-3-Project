export type Role = 'CUSTOMER' | 'ADMIN' | 'STATION_STAFF';

export type ChargerStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'UNDER_MAINTENANCE';

export type ConnectorType = 'CCS2' | 'Type 2' | 'CHAdeMO' | 'GB/T';

export type ReservationStatus = 'PENDING' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface User {
  user_id: string;
  full_name: string;
  email: string;
  role: Role;
  phone_number: string;
  wallet_balance: number;
  created_at: string;
}

export interface Vehicle {
  vehicle_id: string;
  user_id: string;
  make: string;
  model: string;
  registration_no: string;
  battery_capacity_kwh: number;
  connector_type: ConnectorType;
}

export interface Tariff {
  tariff_id: string;
  station_id: string;
  base_rate_per_kwh: number;
  peak_hour_rate_per_kwh: number;
  peak_start_time: string;
  peak_end_time: string;
  idle_fee_per_min: number;
  currency: string;
}

export interface Charger {
  charger_id: string;
  station_id: string;
  charger_identifier: string;
  connector_type: ConnectorType;
  max_power_kw: number;
  current_status: ChargerStatus;
}

export interface ChargingStation {
  station_id: string;
  name: string;
  address: string;
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
  total_ports: number;
  operational_status: 'OPERATIONAL' | 'UNDER_MAINTENANCE' | 'CLOSED';
  tariff?: Tariff;
  chargers?: Charger[];
  available_chargers?: number;
}

export interface Reservation {
  reservation_id: string;
  user_id: string;
  vehicle_id: string;
  charger_id: string;
  start_time: string;
  end_time: string;
  status: ReservationStatus;
  estimated_cost: number;
  created_at: string;
  station_name?: string;
  charger_identifier?: string;
  vehicle_model?: string;
}

export interface ChargingSession {
  session_id: string;
  reservation_id: string | null;
  charger_id: string;
  user_id: string;
  vehicle_id: string;
  actual_start_time: string;
  actual_end_time: string | null;
  initial_soc: number;
  final_soc: number | null;
  energy_delivered_kwh: number;
  energy_cost: number;
  peak_surcharge: number;
  gst_tax: number;
  total_amount: number;
  payment_status: PaymentStatus;
  station_name?: string;
  charger_identifier?: string;
}

export interface UserReview {
  review_id: string;
  user_id: string;
  station_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
}
