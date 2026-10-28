'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Zap, MapPin, CalendarClock, ShieldCheck, 
  ArrowRight, Activity, BatteryCharging, Sparkles, CheckCircle2,
  Lock, BarChart3, Database
} from 'lucide-react';
import HowItWorksModal from '@/components/HowItWorksModal';

export default function HomePage() {
  const router = useRouter();
  const [isHowModalOpen, setIsHowModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalStations: 5,
    totalChargers: 20,
    availableChargers: 17,
    activeReservations: 2
  });

  const handleQuickLogin = (role: 'CUSTOMER' | 'ADMIN') => {
    const demoUser = role === 'CUSTOMER' ? {
      user_id: 'usr_001',
      full_name: 'Namith Kumar Chandrakumar',
      email: 'namith@ev.com',
      role: 'CUSTOMER',
      wallet_balance: 1450.00
    } : {
      user_id: 'usr_admin',
      full_name: 'Station Network Administrator',
      email: 'admin@ev.com',
      role: 'ADMIN',
      wallet_balance: 50000.00
    };

    localStorage.setItem('voltreserve_user', JSON.stringify(demoUser));
    window.dispatchEvent(new Event('storage'));

    if (role === 'CUSTOMER') {
      router.push('/stations');
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Glowing background orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Left Column: Headline & CTA */}
            <div className="max-w-2xl space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>PES University • DBMS Level 3 Experiential Learning</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Smart EV Charging Network with <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Guaranteed Reservations</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                Never wait in line again. VoltReserve combines <strong>relational ACID concurrency locking</strong>, 
                <strong>automated trigger state machines</strong>, and <strong>NoSQL IoT telemetry</strong> to deliver 
                a seamless charging experience across Bengaluru.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/stations"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center justify-center space-x-2"
                >
                  <MapPin className="w-5 h-5" />
                  <span>Explore Stations</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => setIsHowModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md transition-all flex items-center justify-center space-x-2"
                >
                  <span>See How It Works</span>
                </button>
              </div>

              {/* Student Authors Badge */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Created by:</span>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200">
                  Namith Kumar C (PES1UG24AM171)
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200">
                  Kushal G (PES1UG24AM145)
                </span>
              </div>
            </div>

            {/* Right Column: 1-Click Evaluation / Quick Login Card */}
            <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase font-mono">
                    Evaluation Shortcut
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                    1-Click Ready
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">Instant Portal Access</h3>
                <p className="text-xs text-slate-400">
                  For evaluators and testing: Select a predefined role to test right away without typing credentials.
                </p>
              </div>

              <div className="space-y-3">
                {/* Customer 1-Click */}
                <button
                  onClick={() => handleQuickLogin('CUSTOMER')}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-500/40 hover:border-emerald-400 text-left transition group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-white group-hover:text-emerald-300 transition flex items-center space-x-1.5">
                        <span>Log In as Customer (EV Driver)</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Namith Kumar • Tata Nexon EV • ₹1,450 Wallet
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition" />
                  </div>
                </button>

                {/* Admin 1-Click */}
                <button
                  onClick={() => handleQuickLogin('ADMIN')}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/40 hover:border-amber-400 text-left transition group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-white group-hover:text-amber-300 transition flex items-center space-x-1.5">
                        <span>Log In as Station Administrator</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Access Live CTE Analytics & Charger Maintenance
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition" />
                  </div>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                <Link href="/login" className="hover:text-emerald-400 underline underline-offset-2">
                  Regular Login Page
                </Link>
                <Link href="/signup" className="hover:text-emerald-400 underline underline-offset-2">
                  New Customer Sign Up
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Real-time Availability & Live Stats Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{stats.totalStations}</div>
              <div className="text-xs font-medium text-slate-500">Active Bengaluru Hubs</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-3 bg-cyan-50 rounded-xl text-cyan-600">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{stats.availableChargers} / {stats.totalChargers}</div>
              <div className="text-xs font-medium text-slate-500">Live Guns Available</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <CalendarClock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">0% Collision</div>
              <div className="text-xs font-medium text-slate-500">ACID Overlap Guard</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">100% Automated</div>
              <div className="text-xs font-medium text-slate-500">Trigger State Machine</div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Journey / "How It Works" Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase">
            Simple 4-Step Experience
          </span>
          <h2 className="text-3xl font-bold text-slate-900">
            How VoltReserve Works for Customers
          </h2>
          <p className="text-sm text-slate-600">
            We built every step to be crystal clear so any customer can book, charge, and inspect their charging bill without confusion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-4">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Select Station</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Browse stations in Indiranagar, Koramangala, Whitefield, etc., with live gun availability and pricing.
            </p>
            <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded inline-block">
              SQL View: vw_station_live_status
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-lg mb-4">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Reserve Slot</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Choose your time window. The database prevents overlapping bookings using atomic serializable row locking.
            </p>
            <div className="text-[11px] font-mono text-cyan-700 bg-cyan-50 px-2 py-1 rounded inline-block">
              sp_create_reservation_atomic
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg mb-4">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Plug In & Charge</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Hit &apos;Start Charging&apos;. The charger state changes automatically to OCCUPIED via database triggers while IoT logs temperature.
            </p>
            <div className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-1 rounded inline-block">
              trg_on_session_start & NoSQL
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg mb-4">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Instant Invoicing</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Session finishes, calculates peak vs off-peak rates + 18% GST, deducts wallet balance, and frees the charger.
            </p>
            <div className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-1 rounded inline-block">
              sp_complete_charging_session
            </div>
          </div>

        </div>
      </section>

      {/* DBMS Level 3 Rigor Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border border-slate-700">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-700">
            <div>
              <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase font-mono">
                DBMS Experiential Learning Level 3 Requirements
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold mt-1">
                Advanced Database Architecture Compliance
              </h2>
            </div>
            <Link
              href="/admin/sql-playground"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center space-x-2 transition shadow-md"
            >
              <Database className="w-4 h-4" />
              <span>Launch Live SQL Viva Console</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Unit 1 & 3: Relational Schema & BCNF</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Normalized to Boyce-Codd Normal Form (BCNF) with strict primary keys, foreign keys (`ON DELETE CASCADE`), and check constraints.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Unit 2: Triggers, Views & CTE Analytics</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated charger state machine triggers, peak-hour reservation CTEs, and revenue ranking using `DENSE_RANK() OVER (PARTITION BY city)`.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Unit 4: NoSQL MongoDB Aggregation</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                High-frequency IoT charger telemetry pipeline with thermal stress detection ($match, $group, $cond, $project) preventing battery overheating.
              </p>
            </div>
          </div>
        </div>
      </section>

      <HowItWorksModal isOpen={isHowModalOpen} onClose={() => setIsHowModalOpen(false)} />
    </div>
  );
}
