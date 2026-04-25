'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { listenToMyListings } from '@/services/index.js';
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

/* ── SVG Bar Chart ────────────────────────────────────────────── */
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-3 h-40 pt-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-xs font-bold text-primary">₹{(d.value / 1000).toFixed(0)}k</span>
          <div className="w-full rounded-t-lg bg-primary/20 relative overflow-hidden" style={{ height: '100px' }}>
            <div
              className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg transition-all duration-700"
              style={{ height: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-semibold text-secondary text-center leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── SVG Donut Chart ──────────────────────────────────────────── */
function DonutChart({ segments }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const COLORS = ['#416743', '#7da67d', '#959f8e', '#c2eec0', '#a7d1a5'];
  let offset = 0;
  const r = 60, cx = 70, cy = 70, stroke = 22;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <svg width="140" height="140" className="flex-shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ebeeef" strokeWidth={stroke} />
        {segments.map((seg, i) => {
          const frac = seg.value / total;
          const dash = frac * circ;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={COLORS[i % COLORS.length]} strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset * circ / total + circ * 0.25}
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          );
          offset += seg.value;
          return el;
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" className="text-sm" fontSize="14" fontWeight="700" fill="#181c1d">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#615e57">listings</text>
      </svg>
      <div className="flex flex-col gap-2 flex-1">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-sm text-on-surface flex-1 truncate">{seg.label}</span>
            <span className="text-sm font-bold text-primary">{seg.value}</span>
            <span className="text-xs text-secondary w-10 text-right">{Math.round(seg.value / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}



/* ── Stat Card ────────────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, color = 'bg-primary-fixed', iconColor = 'text-primary', trend }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-surface-container shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 ${color} rounded-xl ${iconColor}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {trend && <span className={`text-xs font-bold ${trend >= 0 ? 'text-green-600' : 'text-error'}`}>{trend >= 0 ? '+' : ''}{trend}%</span>}
      </div>
      <p className="text-2xl font-bold text-on-surface mb-0.5">{value}</p>
      <p className="text-sm font-semibold text-on-surface">{label}</p>
      {sub && <p className="text-xs text-secondary mt-0.5">{sub}</p>}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function AnalyticsPage() {
  const router = useRouter();
  const [listings, setListings] = useState([]);

  useEffect(() => {
    let unsubListings = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        try {
          unsubListings = listenToMyListings((data) => setListings(data));
        } catch (error) {
          console.error(error);
        }
      } else {
        setListings([]);
        if (unsubListings) unsubListings();
      }
    });

    return () => {
      unsubAuth();
      if (unsubListings) unsubListings();
    };
  }, []);

  /* Derived metrics */
  const totalRevenue = listings.reduce((s, l) => s + Number(l.price || 0), 0);
  const totalQty     = listings.reduce((s, l) => s + Number(l.quantity || 0), 0);
  const active       = listings.filter(l => l.status === 'ACTIVE').length;
  const avgConf      = listings.length
    ? Math.round(listings.reduce((s, l) => s + (l.confidence || 0), 0) / listings.length)
    : 0;

  /* Material distribution */
  const matMap = {};
  listings.forEach(l => { if (l.material) matMap[l.material] = (matMap[l.material] || 0) + 1; });
  const matSegments = Object.entries(matMap).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);

  /* Revenue by material */
  const revMap = {};
  listings.forEach(l => { if (l.material) revMap[l.material] = (revMap[l.material] || 0) + Number(l.price || 0); });
  const revBars = Object.entries(revMap).map(([label, value]) => ({ label: label.split(' ')[0], value }));

  /* Status distribution */
  const statusCounts = { ACTIVE: 0, PENDING: 0, DRAFT: 0 };
  listings.forEach(l => { if (statusCounts[l.status] !== undefined) statusCounts[l.status]++; });



  return (
    <>
      <Navbar />
      <main className="max-w-container mx-auto px-4 md:px-6 py-10 pb-32 md:pb-14 min-h-screen">

        {/* Header */}
        <div className="mb-10">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2">Seller Portal</span>
          <h1 className="text-h1 font-bold text-on-background tracking-tight">Analytics</h1>
          <p className="text-secondary mt-1 text-sm">Live metrics from your {listings.length} material listing{listings.length !== 1 ? 's' : ''}.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="inventory_2"  label="Total Listings"  value={listings.length}    sub={`${active} active`}       color="bg-primary-fixed"     iconColor="text-primary"   trend={12} />
          <StatCard icon="payments"     label="Total Revenue"   value={`₹${totalRevenue.toLocaleString('en-IN')}`} sub="estimated"  color="bg-secondary-container" iconColor="text-secondary"  trend={8}  />
          <StatCard icon="scale"        label="Total Quantity"  value={`${totalQty} kg`}   sub="across all listings"      color="bg-tertiary-container" iconColor="text-tertiary"  trend={5}  />
          <StatCard icon="psychology"   label="Avg AI Confidence" value={`${avgConf}%`}    sub="detection accuracy"       color="bg-primary-fixed"     iconColor="text-primary"             />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Material Distribution */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-surface-container shadow-sm">
            <h2 className="font-bold text-on-surface mb-1">Material Mix</h2>
            <p className="text-xs text-secondary mb-5">Distribution by type</p>
            {matSegments.length > 0 ? <DonutChart segments={matSegments} /> : (
              <div className="flex items-center justify-center h-32 text-secondary text-sm">No data yet</div>
            )}
          </div>

          {/* Revenue by Material */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-surface-container shadow-sm">
            <h2 className="font-bold text-on-surface mb-1">Revenue by Material</h2>
            <p className="text-xs text-secondary mb-4">Total listing value (₹)</p>
            {revBars.length > 0 ? <BarChart data={revBars} /> : (
              <div className="flex items-center justify-center h-32 text-secondary text-sm">No data yet</div>
            )}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-1 gap-6 mb-8">

          {/* Status Breakdown — full width */}
          <div className="bg-white rounded-2xl p-6 border border-surface-container shadow-sm">
            <h2 className="font-bold text-on-surface mb-1">Listing Status</h2>
            <p className="text-xs text-secondary mb-6">Breakdown of your listings by current status</p>
            <div className="space-y-5">
              {[
                { key: 'ACTIVE',  label: 'Active',  color: 'bg-green-500',  textColor: 'text-green-700',  bg: 'bg-green-50',  dot: 'bg-green-500'  },
                { key: 'PENDING', label: 'Pending', color: 'bg-yellow-400', textColor: 'text-yellow-700', bg: 'bg-yellow-50', dot: 'bg-yellow-400' },
                { key: 'DRAFT',   label: 'Draft',   color: 'bg-gray-400',   textColor: 'text-gray-600',   bg: 'bg-gray-50',   dot: 'bg-gray-400'   },
              ].map(({ key, label, color, textColor, bg, dot }) => {
                const count = statusCounts[key];
                const pct = listings.length ? Math.round(count / listings.length * 100) : 0;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                        <span className={`text-sm font-semibold ${textColor}`}>{label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bg} ${textColor}`}>{count} listing{count !== 1 ? 's' : ''}</span>
                        <span className="text-sm font-bold text-on-surface w-10 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {listings.length === 0 && (
              <p className="text-sm text-secondary text-center mt-6">No listings yet — add your first material to see status breakdown.</p>
            )}
          </div>

        </div>

        {/* Recent Listings Table */}
        <div className="bg-white rounded-2xl border border-surface-container shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-surface-container">
            <div>
              <h2 className="font-bold text-on-surface">Recent Listings</h2>
              <p className="text-xs text-secondary mt-0.5">Your latest materials</p>
            </div>
            <button onClick={() => router.push('/seller/my-listings')}
              className="text-primary text-sm font-semibold hover:opacity-70 transition-all flex items-center gap-1">
              View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          {listings.length === 0 ? (
            <div className="py-16 text-center text-secondary text-sm">No listings yet. <button onClick={() => router.push('/seller/add-material')} className="text-primary font-semibold">Add one →</button></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-container-low">
                  <tr>
                    {['Material', 'Type', 'Qty', 'Price (₹)', 'Status', 'AI Conf.'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-[10px] font-bold text-outline uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {[...listings].reverse().slice(0, 8).map(l => (
                    <tr key={l.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-4 font-semibold text-on-surface truncate max-w-[180px]">{l.name}</td>
                      <td className="px-6 py-4 text-secondary">{l.material}</td>
                      <td className="px-6 py-4">{l.quantity} {l.unit}</td>
                      <td className="px-6 py-4 font-semibold text-primary">₹{Number(l.price || 0).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          l.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' :
                          l.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>{l.status}</span>
                      </td>
                      <td className="px-6 py-4 text-secondary">{l.confidence ? `${l.confidence}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
