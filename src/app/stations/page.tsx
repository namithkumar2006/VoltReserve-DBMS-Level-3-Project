'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapPin, Search, Filter, Zap, Clock, ShieldCheck, 
  AlertCircle, CheckCircle2, ChevronRight, X, Sparkles, Battery
} from 'lucide-react';
import { ChargingStation, Charger, User } from '@/types';

export default function StationsPage() {
  const router = useRouter();
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConnector, setSelectedConnector] = useState<string>('ALL');
  const [onlyFastCharging, setOnlyFastCharging] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Modal reservation state
  const [activeCharger, setActiveCharger] = useState<{ charger: Charger; station: ChargingStation } | null>(null);
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 15);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  });
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [reserving, setReserving] = useState(false);
  const [reservationError, setReservationError] = useState('');
  const [reservationSuccess, setReservationSuccess] = useState('');

  useEffect(() => {
    // Check logged in user
    const stored = localStorage.getItem('voltreserve_user');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }

    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stations');
      const data = await res.json();
      if (data.success) {
        setStations(data.stations);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredStations = stations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          station.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          station.city.toLowerCase().includes(searchQuery.toLowerCase());

    const hasMatchingConnector = selectedConnector === 'ALL' ||
      station.chargers?.some(c => c.connector_type === selectedConnector);

    const hasFastCharger = !onlyFastCharging ||
      station.chargers?.some(c => c.max_power_kw >= 50);

    return matchesSearch && hasMatchingConnector && hasFastCharger;
  });

  const openReservationModal = (charger: Charger, station: ChargingStation) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setActiveCharger({ charger, station });
    setReservationError('');
    setReservationSuccess('');
  };

  const handleCreateReservation = async () => {
    if (!activeCharger || !currentUser) return;
    setReserving(true);
    setReservationError('');
    setReservationSuccess('');

    try {
      const startDateTime = new Date(`${bookingDate}T${bookingTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.user_id,
          vehicleId: 'veh_001',
          chargerId: activeCharger.charger.charger_id,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reserve slot');
      }

      setReservationSuccess('Slot confirmed! Overlap check passed via ACID transaction.');
      fetchStations(); // Refresh live availability
      setTimeout(() => {
        setActiveCharger(null);
        router.push('/reservations');
      }, 1500);
    } catch (err: any) {
      setReservationError(err.message);
    } finally {
      setReserving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Bengaluru Charging Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Explore Charging Stations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time charger availability, transparent tariffs, and collision-free reservations
          </p>
        </div>

        {/* Live SQL View Badge */}
        <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Backed by View: vw_station_live_status</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by area (e.g. Indiranagar, Koramangala, Whitefield)..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['ALL', 'CCS2', 'Type 2', 'CHAdeMO'].map((connector) => (
              <button
                key={connector}
                onClick={() => setSelectedConnector(connector)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedConnector === connector
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {connector}
              </button>
            ))}

            <button
              onClick={() => setOnlyFastCharging(!onlyFastCharging)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                onlyFastCharging
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Fast DC (&ge;50kW)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stations Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Fetching real-time station statuses...</p>
        </div>
      ) : filteredStations.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800">No Charging Stations Found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search query or connector filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredStations.map((station) => (
            <div
              key={station.station_id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                
                {/* Station Top Details */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h3 className="text-lg font-bold text-slate-900">{station.name}</h3>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center space-x-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{station.address}, {station.city}</span>
                    </p>
                  </div>

                  <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    {station.available_chargers} of {station.chargers?.length} Available
                  </span>
                </div>

                {/* Tariff Bar */}
                {station.tariff && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">STANDARD TARIFF</span>
                      <div className="font-bold text-slate-800 text-sm">
                        ₹{station.tariff.base_rate_per_kwh.toFixed(2)} <span className="text-[10px] text-slate-500">/ kWh</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-600 font-medium">PEAK HOURS (17:00 - 22:00)</span>
                      <div className="font-bold text-amber-700 text-sm">
                        ₹{station.tariff.peak_hour_rate_per_kwh.toFixed(2)} <span className="text-[10px] text-slate-500">/ kWh</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chargers / Gun Ports */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Available Guns & Charging Speeds
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {station.chargers?.map((charger) => {
                      const isAvailable = charger.current_status === 'AVAILABLE';
                      const isReserved = charger.current_status === 'RESERVED';
                      const isOccupied = charger.current_status === 'OCCUPIED';
                      const isMaint = charger.current_status === 'UNDER_MAINTENANCE';

                      return (
                        <div
                          key={charger.charger_id}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                            isAvailable
                              ? 'bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-400'
                              : isReserved
                              ? 'bg-amber-50/40 border-amber-200'
                              : isOccupied
                              ? 'bg-blue-50/40 border-blue-200'
                              : 'bg-slate-100 border-slate-200 opacity-60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-xs text-slate-800">{charger.charger_identifier}</span>
                              <span className="text-[10px] font-mono px-1 rounded bg-slate-200/70 text-slate-700">
                                {charger.connector_type}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                              {charger.max_power_kw} kW • {charger.max_power_kw >= 100 ? 'Ultra DC' : charger.max_power_kw >= 50 ? 'DC Fast' : 'AC Standard'}
                            </div>
                          </div>

                          <div>
                            {isAvailable ? (
                              <button
                                onClick={() => openReservationModal(charger, station)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition"
                              >
                                Reserve
                              </button>
                            ) : (
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                                isReserved
                                  ? 'bg-amber-100 text-amber-800'
                                  : isOccupied
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-200 text-slate-600'
                              }`}>
                                {charger.current_status}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Station Card Footer */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono">Lat: {station.latitude.toFixed(4)}, Lon: {station.longitude.toFixed(4)}</span>
                <span className="font-medium text-emerald-700">24/7 Monitored</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reservation Modal */}
      {activeCharger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Reserve Charger Slot</h3>
                  <p className="text-xs text-slate-400">
                    {activeCharger.station.name} • {activeCharger.charger.charger_identifier}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCharger(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              
              {/* Alert Feedback */}
              {reservationError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <div>
                    <strong className="font-semibold block">Overlap Prevention Activated</strong>
                    <span>{reservationError}</span>
                  </div>
                </div>
              )}

              {reservationSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{reservationSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Booking Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Charging Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMinutes(mins)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        durationMinutes === mins
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {mins} Minutes
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost Calculation Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Charger Power Rating</span>
                  <span className="font-bold">{activeCharger.charger.max_power_kw} kW ({activeCharger.charger.connector_type})</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Station Base Rate</span>
                  <span className="font-bold">₹{activeCharger.station.tariff?.base_rate_per_kwh.toFixed(2)} / kWh</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-800">Projected Estimate</span>
                  <span className="text-base font-black text-emerald-600 font-mono">
                    ₹{((durationMinutes / 60) * Math.min(activeCharger.charger.max_power_kw, 50) * 0.8 * (activeCharger.station.tariff?.base_rate_per_kwh || 16)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 text-[11px] text-purple-900 border border-purple-200 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  <strong>DBMS Integrity Guarantee:</strong> Stored procedure <code className="font-mono">sp_create_reservation_atomic</code> acquires an exclusive row lock on this charger to ensure zero slot overlap.
                </span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveCharger(null)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={reserving}
                onClick={handleCreateReservation}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition disabled:opacity-50"
              >
                {reserving ? 'Executing Transaction...' : 'Confirm Reservation'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
