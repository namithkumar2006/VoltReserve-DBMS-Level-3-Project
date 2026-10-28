'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Mail, Lock, ArrowRight, Shield, User, AlertCircle, Check } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save user session
      localStorage.setItem('voltreserve_user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('storage'));

      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/stations');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const autofill = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('scrypt_pass_123');
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
            <Zap className="w-7 h-7 fill-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome to VoltReserve
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to reserve EV chargers, track charging sessions, and manage billing
          </p>
        </div>

        {/* Evaluation 1-Click Autofill Bar */}
        <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider font-mono">
              Demo Fast-Login (1 Click)
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">Click to fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => autofill('namith@ev.com')}
              className="p-2 rounded-lg bg-white border border-emerald-200 text-slate-700 hover:bg-emerald-100 hover:border-emerald-300 transition text-left font-medium"
            >
              <div className="font-semibold text-emerald-800">Namith (Customer)</div>
              <div className="text-[10px] text-slate-500">Tata Nexon EV</div>
            </button>
            <button
              type="button"
              onClick={() => autofill('kushal@ev.com')}
              className="p-2 rounded-lg bg-white border border-emerald-200 text-slate-700 hover:bg-emerald-100 hover:border-emerald-300 transition text-left font-medium"
            >
              <div className="font-semibold text-emerald-800">Kushal (Customer)</div>
              <div className="text-[10px] text-slate-500">MG ZS EV</div>
            </button>
            <button
              type="button"
              onClick={() => autofill('admin@ev.com')}
              className="col-span-2 p-2 rounded-lg bg-white border border-amber-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300 transition text-left font-medium flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-amber-900 flex items-center space-x-1">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>Station Administrator</span>
                </div>
                <div className="text-[10px] text-slate-500">Admin Control & CTE Analytics</div>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                admin@ev.com
              </span>
            </button>
          </div>
        </div>

        {/* Main Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="namith@ev.com or admin@ev.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">Any password for demo</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-emerald-600 font-semibold hover:underline">
              Create an EV driver account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
