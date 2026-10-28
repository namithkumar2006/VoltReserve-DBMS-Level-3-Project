'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Shield, Zap, Activity, AlertTriangle, CheckCircle2, 
  Terminal, BarChart3, TrendingUp, RefreshCw, Wrench, Flame
} from 'lucide-react';
import { Charger, ChargingStation } from '@/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [nosqlTelemetry, setNosqlTelemetry] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('voltreserve_user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setCurrentUser(u);
        if (u.role !== 'ADMIN') {
          // If not admin, still allow viewing with informative banner or let them stay for demo
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [chargersRes, analyticsRes] = await Promise.all([
        fetch('/api/chargers'),
        fetch('/api/analytics')
      ]);

      const cData = await chargersRes.json();
      const aData = await analyticsRes.json();

      if (cData.success) setChargers(cData.chargers);
      if (aData.success) {
        setAnalytics(aData.analytics);
        setNosqlTelemetry(aData.nosqlTelemetry);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMaintenance = async (charger: Charger) => {
    const nextStatus = charger.current_status === 'UNDER_MAINTENANCE' ? 'AVAILABLE' : 'UNDER_MAINTENANCE';
    try {
      const res = await fetch('/api/chargers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chargerId: charger.charger_id,
          status: nextStatus
        })
      });

      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Charger ${charger.charger_identifier} updated to ${nextStatus}`);
        fetchAdminData();
        setTimeout(() => setActionSuccess(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Administrator Control Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Network Operations & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Hardware maintenance controls, SQL CTE analytics, and MongoDB IoT telemetry pipelines
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAdminData}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Refresh analytics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            href="/admin/sql-playground"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center space-x-2 transition shadow-md"
          >
            <Terminal className="w-4 h-4" />
            <span>Open SQL Viva Playground</span>
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Network Overview Stats */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Available Guns</div>
            <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
              {analytics.statusCounts.available} <span className="text-xs text-slate-400 font-normal">/ {analytics.statusCounts.total}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Ready for driver booking</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Under Maintenance</div>
            <div className="text-2xl font-black text-amber-600 font-mono mt-1">
              {analytics.statusCounts.maintenance}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Service lock applied</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Total Energy Dispensed</div>
            <div className="text-2xl font-black text-cyan-600 font-mono mt-1">
              {analytics.totalEnergyDeliveredKwh.toFixed(1)} kWh
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Across all 5 stations</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Gross Revenue Recorded</div>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">
              ₹{analytics.totalRevenueInr.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Energy + Peak + GST</div>
          </div>
        </div>
      )}

      {/* ANALYTICS SECTION 1: Window Function DENSE_RANK() & CTE Peak Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CTE Peak Hour Analysis */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-bold text-emerald-600 uppercase font-mono">DBMS QUERY 1: CTE</div>
              <h3 className="text-base font-bold text-slate-900">Peak Hour Reservation Traffic</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
              WITH HourlyCTE
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Identifies traffic spikes throughout the day using Common Table Expressions and classification logic.
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {analytics?.peakHoursCTE?.filter((p: any) => p.bookings > 0).map((p: any) => (
              <div
                key={p.hourLabel}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="font-mono font-bold text-slate-800">{p.hourLabel}</div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    p.demandLevel === 'HIGH_PEAK' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {p.demandLevel}
                  </span>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-900">{p.bookings} Booking(s)</div>
                  <div className="text-[10px] text-slate-500 font-mono">₹{p.revenue.toFixed(2)} projected</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Window Function DENSE_RANK() Station Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-bold text-purple-600 uppercase font-mono">DBMS QUERY 2: WINDOW FUNCTION</div>
              <h3 className="text-base font-bold text-slate-900">Station Revenue Rankings</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono">
              DENSE_RANK() OVER
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Ranks stations within the city partition based on lifetime total revenue settled.
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {analytics?.stationRankings?.map((st: any) => (
              <div
                key={st.station_id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-lg bg-purple-600 text-white font-mono font-bold flex items-center justify-center text-xs">
                    #{st.dense_rank}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{st.name}</div>
                    <div className="text-[10px] text-slate-500">{st.sessions_count} sessions handled</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-emerald-700 font-mono text-sm">
                    ₹{st.total_revenue.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400">{st.total_kwh.toFixed(1)} kWh</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* NoSQL (MongoDB) Telemetry Aggregation Component */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-bold text-cyan-600 uppercase font-mono">
              NoSQL PARADIGM: MONGODB AGGREGATION PIPELINE
            </div>
            <h3 className="text-base font-bold text-slate-900">
              High-Frequency IoT Charger Health & Battery Thermal Stress Detection
            </h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 font-mono self-start sm:self-auto">
            $match ➔ $group ➔ $cond ➔ $project
          </span>
        </div>

        <p className="text-xs text-slate-600">
          Aggregates polymorphic IoT sensor telemetry ticks. Detects abnormal battery heating (&gt;42°C) and prevents cell degradation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {nosqlTelemetry.map((item) => {
            const isWarning = item.health_status === 'THERMAL_WARNING';
            return (
              <div
                key={item.charger_id}
                className={`p-4 rounded-xl border ${
                  isWarning ? 'bg-amber-50/60 border-amber-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs text-slate-800">{item.charger_id}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isWarning ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.health_status}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-800">{item.station_name}</div>

                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Avg Power:</span>
                    <span className="font-mono font-bold">{item.avg_power_kw} kW</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Max Temp:</span>
                    <span className="font-mono font-bold text-amber-700">{item.max_battery_temp_celsius} °C</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Overheat Flags:</span>
                    <span className="font-mono font-bold">{item.overheating_events}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fleet Charger Maintenance Control Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Charger Fleet Maintenance Controls</h3>
            <p className="text-xs text-slate-500">Toggle maintenance mode to test database exclusion from driver reservations</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{chargers.length} chargers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Charger ID</th>
                <th className="py-3 px-4">Identifier / Gun</th>
                <th className="py-3 px-4">Connector</th>
                <th className="py-3 px-4">Max kW</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Maintenance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {chargers.map((c) => {
                const isMaint = c.current_status === 'UNDER_MAINTENANCE';
                return (
                  <tr key={c.charger_id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.charger_id}</td>
                    <td className="py-3 px-4">{c.charger_identifier}</td>
                    <td className="py-3 px-4 font-mono">{c.connector_type}</td>
                    <td className="py-3 px-4 font-mono">{c.max_power_kw} kW</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.current_status === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.current_status === 'RESERVED'
                          ? 'bg-amber-100 text-amber-800'
                          : c.current_status === 'OCCUPIED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {c.current_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleMaintenance(c)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ml-auto ${
                          isMaint
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                        }`}
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>{isMaint ? 'Set to AVAILABLE' : 'Mark MAINTENANCE'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
