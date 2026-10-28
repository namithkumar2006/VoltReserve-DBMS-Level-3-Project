'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Zap, MapPin, Calendar, Receipt, Shield, Terminal, HelpCircle, LogOut, User as UserIcon } from 'lucide-react';
import HowItWorksModal from './HowItWorksModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  useEffect(() => {
    // Check local storage for logged in user session
    const stored = localStorage.getItem('voltreserve_user');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default initial mock session as Customer (Namith) so pages work right away
      const defaultUser = {
        user_id: 'usr_001',
        full_name: 'Namith Kumar Chandrakumar',
        email: 'namith@ev.com',
        role: 'CUSTOMER',
        wallet_balance: 1450.00
      };
      localStorage.setItem('voltreserve_user', JSON.stringify(defaultUser));
      setCurrentUser(defaultUser);
    }

    const handleStorage = () => {
      const updated = localStorage.getItem('voltreserve_user');
      if (updated) setCurrentUser(JSON.parse(updated));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('voltreserve_user');
    setCurrentUser(null);
    router.push('/login');
  };

  const navLinks = [
    { href: '/stations', label: 'Explore Stations', icon: MapPin },
    { href: '/reservations', label: 'Reservations & Charging', icon: Calendar },
    { href: '/billing', label: 'Billing', icon: Receipt },
    { href: '/admin', label: 'Admin Hub', icon: Shield, adminOnly: true },
    { href: '/admin/sql-playground', label: 'SQL Playground', icon: Terminal, highlight: true }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
                <Zap className="w-6 h-6 fill-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Volt<span className="text-emerald-600">Reserve</span>
                </span>
                <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 tracking-wide uppercase">
                  DBMS L3
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                // Skip admin link if customer
                if (link.adminOnly && currentUser?.role !== 'ADMIN') {
                  return null;
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                        : link.highlight
                        ? 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Profile & Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* "How It Works" Help Button */}
              <button
                onClick={() => setIsHowItWorksOpen(true)}
                className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition"
                title="Understand system workflow"
              >
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span className="hidden lg:inline">How It Works</span>
              </button>

              {currentUser ? (
                <div className="flex items-center space-x-2">
                  {/* Wallet Balance Pill */}
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-[10px] text-slate-400 font-medium">WALLET</span>
                    <span className="text-xs font-bold text-emerald-600 font-mono">
                      ₹{Number(currentUser.wallet_balance || 1450).toFixed(2)}
                    </span>
                  </div>

                  {/* Role Badge */}
                  <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {currentUser.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-semibold text-slate-800 leading-tight">
                        {currentUser.full_name?.split(' ')[0]}
                      </div>
                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        currentUser.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {currentUser.role}
                      </span>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="text-xs font-semibold px-3 py-1.5 text-slate-700 hover:text-slate-900"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="text-xs font-semibold px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-xs"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      <HowItWorksModal isOpen={isHowItWorksOpen} onClose={() => setIsHowItWorksOpen(false)} />
    </>
  );
}
