'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, Database, Terminal, ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Volt<span className="text-emerald-400">Reserve</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart EV Charging Network & Reservation System demonstrating advanced Relational & NoSQL database concepts.
            </p>
            <div className="text-[11px] text-emerald-400 font-mono">
              PostgreSQL + MongoDB Hybrid Engine
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-100 flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Academic Details</span>
            </div>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li><strong className="text-slate-300">Course:</strong> DBMS Experiential Learning</li>
              <li><strong className="text-slate-300">Level:</strong> Level 3 Project</li>
              <li><strong className="text-slate-300">Instructor:</strong> Dr. Nagasundari S</li>
              <li><strong className="text-slate-300">Department:</strong> CSE, PES University</li>
            </ul>
          </div>

          {/* Project Team */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-100">
              Project Team
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <div className="font-semibold text-slate-200">Namith Kumar Chandrakumar</div>
                <div className="text-[11px] text-emerald-400 font-mono">SRN: PES1UG24AM171</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <div className="font-semibold text-slate-200">Kushal G</div>
                <div className="text-[11px] text-emerald-400 font-mono">SRN: PES1UG24AM145</div>
              </div>
            </div>
          </div>

          {/* Quick Viva & DBMS shortcuts */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-100 flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>DBMS Deliverables</span>
            </div>
            <ul className="text-xs space-y-1.5">
              <li>
                <Link href="/admin/sql-playground" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
                  Interactive SQL & NoSQL Console
                </Link>
              </li>
              <li>
                <Link href="/stations" className="text-slate-400 hover:text-slate-200">
                  Live Overlap Prevention Demo
                </Link>
              </li>
              <li>
                <Link href="/reservations" className="text-slate-400 hover:text-slate-200">
                  Trigger State Transition Simulator
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-slate-400 hover:text-slate-200">
                  CTE & Window Function Analytics
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} VoltReserve EV System. All rights reserved.
          </div>
          <div className="mt-2 sm:mt-0">
            PES University Department of Computer Science & Engineering
          </div>
        </div>
      </div>
    </footer>
  );
}
