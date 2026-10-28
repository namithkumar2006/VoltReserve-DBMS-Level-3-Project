'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, Zap, Clock, ShieldCheck, CheckCircle2, 
  Play, Square, AlertCircle, RefreshCw, BatteryCharging, ArrowRight,
  TrendingUp, Receipt
} from 'lucide-react';
import { Reservation, ChargingSession, User } from '@/types';

export default function ReservationsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Live Charging Simulation State
  const [activeSession, setActiveSession] = useState<ChargingSession | null>(null);
  const [currentSoc, setCurrentSoc] = useState(25);
  const [deliveredKwh, setDeliveredKwh] = useState(0);
  const [livePowerKw, setLivePowerKw] = useState(58.4);
  const [isSimulating, setIsSimulating] = useState(false);
  const [finishingSession, setFinishingSession] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('voltreserve_user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setCurrentUser(u);
        fetchReservations(u.user_id);
      } catch (e) {
        console.error(e);
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  // Charging Simulator timer
  useEffect(() => {
    let interval: any;
    if (isSimulating && activeSession) {
      interval = setInterval(() => {
        setCurrentSoc((prev) => {
          if (prev >= 95) {
            setIsSimulating(false);
            return 95;
          }
          return prev + 1;
        });

        setDeliveredKwh((prev) => Math.round((prev + 0.45) * 100) / 100);

        // Fluctuate kW slightly like real IoT hardware
        setLivePowerKw(Math.round((57 + Math.random() * 4) * 10) / 10);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSimulating, activeSession]);

  const fetchReservations = async (userId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reservations?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setReservations(data.reservations);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      const res = await fetch('/api/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId })
      });
      const data = await res.json();
      if (data.success) {
        if (currentUser) fetchReservations(currentUser.user_id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartCharging = async (res: Reservation) => {
    if (!currentUser) return;
    try {
      const resp = await fetch('/api/charging-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId: res.reservation_id,
          chargerId: res.charger_id,
          userId: currentUser.user_id,
          vehicleId: res.vehicle_id,
          initialSoc: 25
        })
      });

      const data = await resp.json();
      if (data.success) {
        setActiveSession(data.session);
        setCurrentSoc(25);
        setDeliveredKwh(0);
        setIsSimulating(true);
        fetchReservations(currentUser.user_id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStopCharging = async () => {
    if (!activeSession) return;
    setFinishingSession(true);
    setIsSimulating(false);

    try {
      const resp = await fetch('/api/charging-sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.session_id,
          finalSoc: currentSoc,
          energyDeliveredKwh: Math.max(deliveredKwh, 12.5)
        })
      });

      const data = await resp.json();
      if (data.success) {
        // Update user session wallet balance
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            wallet_balance: Math.max(0, currentUser.wallet_balance - data.session.total_amount)
          };
          localStorage.setItem('voltreserve_user', JSON.stringify(updatedUser));
          window.dispatchEvent(new Event('storage'));
        }

        setTimeout(() => {
          router.push('/billing');
        }, 1000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFinishingSession(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Driver Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            My Reservations & Charging Sessions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitor active slot reservations and launch live charging simulations
          </p>
        </div>

        {/* Database Triggers Info Badge */}
        <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-mono text-purple-800">
          <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
          <span>Automated Triggers: trg_on_session_start/end</span>
        </div>
      </div>

      {/* LIVE CHARGING SIMULATOR BOX (Appears when session is running) */}
      {activeSession && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white shadow-2xl border border-emerald-500/40 space-y-6 relative overflow-hidden animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-emerald-500 text-slate-950 rounded-2xl animate-pulse">
                <BatteryCharging className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
                  LIVE HARDWARE SESSION
                </span>
                <h2 className="text-xl sm:text-2xl font-black">
                  Charging Active • {activeSession.session_id}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                disabled={finishingSession}
                onClick={handleStopCharging}
                className="px-6 py-2.5 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>{finishingSession ? 'Computing Bill...' : 'Stop & Generate Bill'}</span>
              </button>
            </div>
          </div>

          {/* Battery State Gauge */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">STATE OF CHARGE (SoC)</span>
              <span className="text-emerald-400 font-mono text-base font-bold">{currentSoc}%</span>
            </div>
            <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-sm shadow-emerald-500"
                style={{ width: `${currentSoc}%` }}
              />
            </div>
          </div>

          {/* Live Telemetry Meters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div className="text-[11px] text-slate-400 font-medium">LIVE POWER RATE</div>
              <div className="text-xl font-black text-emerald-400 font-mono mt-1">{livePowerKw} kW</div>
              <div className="text-[10px] text-slate-500 mt-0.5">DC Fast Protocol</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div className="text-[11px] text-slate-400 font-medium">ENERGY DELIVERED</div>
              <div className="text-xl font-black text-cyan-400 font-mono mt-1">{deliveredKwh} kWh</div>
              <div className="text-[10px] text-slate-500 mt-0.5">+4.5 kWh / min simulated</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div className="text-[11px] text-slate-400 font-medium">BATTERY THERMALS</div>
              <div className="text-xl font-black text-amber-400 font-mono mt-1">34.2 °C</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Optimal Range (NoSQL Log)</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div className="text-[11px] text-slate-400 font-medium">ESTIMATED RUNNING COST</div>
              <div className="text-xl font-black text-white font-mono mt-1">
                ₹{Math.round(deliveredKwh * 16.5 * 1.18)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Inc. 18% GST</div>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center space-x-2 pt-2 border-t border-slate-800 font-mono">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Database Trigger transitioned charger to &apos;OCCUPIED&apos;. IoT sensor stream active.</span>
          </div>
        </div>
      )}

      {/* Reservations List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <span>Your Bookings</span>
          <span className="text-xs font-normal text-slate-500">({reservations.length} total)</span>
        </h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Loading reservations...
          </div>
        ) : reservations.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No Reservations Yet</h3>
            <p className="text-xs text-slate-500">Explore charging hubs and reserve your guaranteed slot.</p>
            <button
              onClick={() => router.push('/stations')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
            >
              Browse Available Stations
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.map((r) => {
              const isActive = r.status === 'ACTIVE';
              const isInProgress = r.status === 'IN_PROGRESS';
              const isCompleted = r.status === 'COMPLETED';
              const isCancelled = r.status === 'CANCELLED';

              return (
                <div
                  key={r.reservation_id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">{r.station_name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : isInProgress
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : isCompleted
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {r.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                      <span><strong>Gun:</strong> {r.charger_identifier}</span>
                      <span><strong>Vehicle:</strong> {r.vehicle_model}</span>
                      <span className="font-mono text-slate-500">
                        {r.start_time} ➔ {r.end_time.split(' ')[1]}
                      </span>
                    </div>

                    <div className="text-xs text-emerald-700 font-medium">
                      Projected Cost: <strong className="font-mono">₹{r.estimated_cost?.toFixed(2)}</strong>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isActive && (
                      <>
                        <button
                          onClick={() => handleStartCharging(r)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition flex items-center space-x-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Plug In & Charge</span>
                        </button>

                        <button
                          onClick={() => handleCancelReservation(r.reservation_id)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700 transition"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {isCompleted && (
                      <button
                        onClick={() => router.push('/billing')}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center space-x-1"
                      >
                        <Receipt className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
