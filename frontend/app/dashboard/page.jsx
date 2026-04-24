'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getListings } from '@/lib/listingsStore';



export default function DashboardPage() {
  const [liveListings, setLiveListings] = useState([]);

  useEffect(() => {
    const all = getListings();
    setLiveListings(all);
  }, []);

  const activeCount   = liveListings.filter(l => l.status === 'ACTIVE').length;
  const totalRevenue  = liveListings.reduce((s, l) => s + Number(l.price || 0), 0);
  const totalQtyKg    = liveListings.reduce((s, l) => s + Number(l.quantity || 0), 0);

  return (
    <>
      <Navbar />
      <main className="max-w-container mx-auto px-6 py-10 md:py-16 pb-32 md:pb-16">

        {/* ── Dashboard Header ── */}
        <div className="mb-10">
          <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-2">
            Enterprise Portal
          </span>
          <h1 className="text-h1 font-bold text-on-background tracking-tight">Seller Dashboard</h1>
        </div>

        {/* ── Analytics Bento Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {/* Active Listings */}
          <div className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-surface-container">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary-fixed rounded-lg text-primary">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <span className="text-xs font-bold text-primary">+12% vs last month</span>
            </div>
            <h3 className="text-h3 font-bold text-on-surface mb-1">{activeCount}</h3>
            <p className="text-secondary text-body-md">Active Listings</p>
            <div className="mt-4 w-full bg-surface-container h-1 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: liveListings.length ? `${Math.round(activeCount / liveListings.length * 100)}%` : '0%' }} />
            </div>
          </div>

          {/* Total Earnings */}
          <div className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-surface-container">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-secondary-container rounded-lg text-secondary">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <span className="text-xs font-bold text-secondary">Est. Revenue</span>
            </div>
            <h3 className="text-h3 font-bold text-on-surface mb-1">₹{totalRevenue.toLocaleString('en-IN')}</h3>
            <p className="text-secondary text-body-md">Total Earnings</p>
            <div className="mt-4 flex items-end gap-1">
              {[8, 12, 10, 14, 16, 12, 14].map((h, i) => (
                <div key={i} className="bg-primary rounded-full w-2" style={{ height: `${h * 3}px` }} />
              ))}
            </div>
          </div>

          {/* Waste Diverted */}
          <div className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-surface-container">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-tertiary-container rounded-lg text-on-tertiary-container">
                <span className="material-symbols-outlined">recycling</span>
              </div>
              <span className="text-xs font-bold text-tertiary">Impact Metric</span>
            </div>
            <h3 className="text-h3 font-bold text-on-surface mb-1">{totalQtyKg.toLocaleString('en-IN')} kg</h3>
            <p className="text-secondary text-body-md">Waste Diverted</p>
            <div className="mt-4 flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xs">person</span>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container text-xs">person</span>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                +14
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-h2 font-bold text-on-background tracking-tight">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                href: '/seller/requests',
                icon: 'inbox',
                label: 'Buyer Requests',
                desc: 'View and respond to incoming buyer requests',
                color: 'bg-blue-50 text-blue-600',
                badge: null,
              },
              {
                href: '/seller/my-listings',
                icon: 'inventory_2',
                label: 'My Listings',
                desc: 'Manage your active material listings',
                color: 'bg-primary-fixed text-primary',
                badge: null,
              },
              {
                href: '/seller/add-material',
                icon: 'add_circle',
                label: 'Add Material',
                desc: 'Upload images and list a new material',
                color: 'bg-tertiary-fixed text-tertiary',
                badge: null,
              },
              {
                href: '/seller/analytics',
                icon: 'bar_chart',
                label: 'Analytics',
                desc: 'View revenue, trends, and material insights',
                color: 'bg-secondary-container text-secondary',
                badge: null,
              },
            ].map(({ href, icon, label, desc, color }) => (
              <Link
                key={href}
                href={href}
                className="bg-white rounded-2xl border border-surface-container p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group flex flex-col gap-4"
              >
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-on-surface mb-1">{label}</h3>
                  <p className="text-xs text-secondary leading-relaxed">{desc}</p>
                </div>
                <div className="flex items-center gap-1 text-primary text-xs font-semibold mt-auto">
                  Go to {label} <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
