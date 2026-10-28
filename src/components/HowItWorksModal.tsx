'use client';

import React from 'react';
import { X, Search, CalendarClock, Zap, Receipt, ShieldCheck } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  if (!isOpen) return null;

  const steps = [
    {
      step: '01',
      title: 'Find & Filter Stations',
      icon: Search,
      desc: 'Locate nearby hubs across Bengaluru (Indiranagar, Koramangala, etc.). Filter by charger connector (CCS2, Type 2) and speed (50kW to 150kW Ultra Fast).',
      badge: 'SQL Views & Indexing'
    },
    {
      step: '02',
      title: 'Book a Guaranteed Slot',
      icon: CalendarClock,
      desc: 'Pick your start time and charging duration. VoltReserve uses ACID transactions with row-level locking to mathematically guarantee no double-booking occurs.',
      badge: 'ACID Concurrency Locking'
    },
    {
      step: '03',
      title: 'Plug In & Charge',
      icon: Zap,
      desc: 'Arrive at the bay and hit Start Charging. An automated database trigger transitions the charger state from AVAILABLE to OCCUPIED and streams live IoT power telemetry.',
      badge: 'Database Triggers & IoT NoSQL'
    },
    {
      step: '04',
      title: 'Automated Billing & Wallet',
      icon: Receipt,
      desc: 'When session finishes, stored procedures calculate base kWh rates, peak-hour surcharges (17:00-22:00), and 18% GST, automatically deducting from your digital wallet.',
      badge: 'Stored Procedures & Tariffs'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">How VoltReserve Works</h2>
              <p className="text-xs text-emerald-100">Smart EV Charging with Real-Time DBMS Guarantees</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            VoltReserve solves EV range anxiety by replacing first-come-first-served chaos with a deterministic, 
            concurrency-safe reservation and telemetry management system. Here is the 4-step workflow:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-300 transition-all duration-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        {item.step}
                      </div>
                      <h3 className="font-semibold text-slate-800 text-sm">{item.title}</h3>
                    </div>
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="mt-3">
                    <span className="inline-block text-[10px] font-medium tracking-wide px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800">
                      {item.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charger State Machine Box */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-emerald-400 font-mono font-medium">DBMS STATE MACHINE</div>
              <div className="text-sm font-semibold">Automatic Charger State Transitions via Triggers</div>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">AVAILABLE</span>
              <span className="text-slate-400">➔</span>
              <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">RESERVED</span>
              <span className="text-slate-400">➔</span>
              <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">OCCUPIED</span>
              <span className="text-slate-400">➔</span>
              <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">AVAILABLE</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
          >
            Got It, Let&apos;s Explore!
          </button>
        </div>
      </div>
    </div>
  );
}
