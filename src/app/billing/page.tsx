'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Receipt, Wallet, Zap, Clock, ArrowDownRight, 
  CheckCircle2, Download, Printer, X, ShieldAlert, Sparkles
} from 'lucide-react';
import { ChargingSession, User } from '@/types';

export default function BillingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeInvoice, setActiveInvoice] = useState<ChargingSession | null>(null);
  const [walletAddedSuccess, setWalletAddedSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('voltreserve_user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setCurrentUser(u);
        fetchSessions(u.user_id);
      } catch (e) {
        console.error(e);
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchSessions = async (userId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/charging-sessions?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = (amount: number) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      wallet_balance: (currentUser.wallet_balance || 0) + amount
    };
    setCurrentUser(updated);
    localStorage.setItem('voltreserve_user', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    setWalletAddedSuccess(true);
    setTimeout(() => setWalletAddedSuccess(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 text-xs font-bold uppercase tracking-wider">
            <Receipt className="w-4 h-4" />
            <span>Billing & Invoices</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Charging History & Invoices
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Transparent energy tariffs, peak surcharge auditing, and instant GST invoices
          </p>
        </div>

        {/* View Summary Badge */}
        <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-xs font-mono text-cyan-800">
          <Sparkles className="w-4 h-4 text-cyan-600 shrink-0" />
          <span>Backed by View: vw_user_billing_history</span>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <Wallet className="w-4 h-4" />
            <span>Digital EV FastPass Wallet</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono">
            ₹{Number(currentUser?.wallet_balance || 0).toFixed(2)}
          </div>
          <p className="text-xs text-emerald-100">
            Auto-deducted upon session completion via stored procedure <code className="font-mono bg-white/20 px-1.5 py-0.5 rounded">sp_complete_charging_session</code>
          </p>
        </div>

        {/* Quick Top-up Buttons */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-emerald-200">Instant Wallet Top-up:</div>
          <div className="flex items-center space-x-2">
            {[500, 1000, 2000].map((amt) => (
              <button
                key={amt}
                onClick={() => handleAddFunds(amt)}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition"
              >
                +₹{amt}
              </button>
            ))}
          </div>
          {walletAddedSuccess && (
            <div className="text-[11px] text-emerald-300 font-medium animate-fade-in flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Funds added successfully!</span>
            </div>
          )}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden space-y-0">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Charging Receipts</h2>
          <span className="text-xs text-slate-500">{sessions.length} recorded sessions</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Fetching billing history...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">No Invoices Found</h3>
            <p className="text-xs text-slate-500">Your completed charging sessions will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Session ID / Date</th>
                  <th className="py-3 px-4">Station & Gun</th>
                  <th className="py-3 px-4">Energy (kWh)</th>
                  <th className="py-3 px-4">Tariff Breakdown</th>
                  <th className="py-3 px-4">GST (18%)</th>
                  <th className="py-3 px-4 font-bold text-slate-800">Total (INR)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {sessions.map((s) => (
                  <tr key={s.session_id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{s.session_id}</div>
                      <div className="text-[10px] text-slate-400">{s.actual_start_time}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{s.station_name}</div>
                      <div className="text-[10px] text-slate-500">{s.charger_identifier}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {s.energy_delivered_kwh.toFixed(2)} kWh
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      <div>Base: ₹{s.energy_cost.toFixed(2)}</div>
                      {s.peak_surcharge > 0 && (
                        <div className="text-amber-700 font-semibold text-[10px]">
                          + Peak: ₹{s.peak_surcharge.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      ₹{s.gst_tax.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-emerald-700 text-sm">
                      ₹{s.total_amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {s.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActiveInvoice(s)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition text-[11px] font-semibold"
                      >
                        View Tax Bill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* TAX INVOICE POPUP MODAL */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Invoice Top Header */}
            <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Tax Invoice / Receipt</h3>
                  <p className="text-xs text-slate-400">VoltReserve EV Network Pvt. Ltd.</p>
                </div>
              </div>
              <button
                onClick={() => setActiveInvoice(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice Body */}
            <div className="p-6 space-y-6 text-xs text-slate-700">
              
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Billed To (EV Driver)</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{currentUser?.full_name}</div>
                  <div className="text-slate-500">{currentUser?.email}</div>
                  <div className="text-slate-500">{currentUser?.phone_number}</div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Invoice Details</span>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">#{activeInvoice.session_id}</div>
                  <div className="text-slate-500">Date: {activeInvoice.actual_start_time}</div>
                  <div className="text-emerald-700 font-bold">SAC Code: 998714 (EV Charging)</div>
                </div>
              </div>

              {/* Station Details */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="font-bold text-slate-900">{activeInvoice.station_name}</div>
                <div className="text-slate-500 text-[11px]">{activeInvoice.charger_identifier}</div>
                <div className="text-slate-500 text-[11px]">
                  Initial SoC: {activeInvoice.initial_soc}% ➔ Final SoC: {activeInvoice.final_soc || 85}%
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Energy Consumed ({activeInvoice.energy_delivered_kwh.toFixed(2)} kWh)</span>
                  <span className="font-mono font-semibold">₹{activeInvoice.energy_cost.toFixed(2)}</span>
                </div>

                {activeInvoice.peak_surcharge > 0 && (
                  <div className="flex justify-between py-1 text-amber-800">
                    <span>Peak Hours Grid Surcharge</span>
                    <span className="font-mono font-semibold">₹{activeInvoice.peak_surcharge.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between py-1 text-slate-600">
                  <span>Goods & Services Tax (GST 18%)</span>
                  <span className="font-mono font-semibold">₹{activeInvoice.gst_tax.toFixed(2)}</span>
                </div>

                <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-center text-sm font-bold text-slate-900">
                  <span>Grand Total Paid</span>
                  <span className="font-mono text-lg text-emerald-700 font-black">
                    ₹{activeInvoice.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Academic Signature */}
              <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-400 flex items-center justify-between">
                <span>DBMS Experiential Learning - Level 3</span>
                <span>PES University • Bangalore</span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Payment Settled from FastPass Wallet</span>
              </span>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
