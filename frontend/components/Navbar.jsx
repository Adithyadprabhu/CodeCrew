'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import NotificationBell from '@/components/NotificationBell';
import ToastContainer from '@/components/ToastContainer';
import { observeAuthState, getUser } from '@/services/index.js';

// Public nav links removed globally

const sellerNavLinks = [
  { href: '/dashboard',             label: 'Dashboard',    icon: 'dashboard'   },
  { href: '/seller/add-material',   label: 'Add Material', icon: 'add_circle'  },
  { href: '/seller/my-listings',    label: 'My Listings',  icon: 'inventory_2' },
  { href: '/seller/requests',       label: 'Requests',     icon: 'inbox'       },
  { href: '/seller/analytics',      label: 'Analytics',    icon: 'bar_chart'   },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [initials, setInitials] = useState('U');

  const isSellerPage = pathname?.startsWith('/seller');

  // Subscribe to Firebase Auth
  useEffect(() => {
    const unsub = observeAuthState(async (user) => {
      if (user) {
        try {
          const uData = await getUser(user.uid);
          if (uData) {
            setRole(uData.role);
            const ini = (uData.fullName || '')
              .split(' ')
              .map(w => w[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();
            setInitials(ini || 'U');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setInitials('U');
        }
      } else {
        setRole(null);
        setInitials('U');
      }
    });
    return () => unsub();
  }, []);

  const handleSignIn = () => {
    if (role === 'buyer') router.push('/auth/buyer');
    else if (role === 'seller') router.push('/auth/seller');
    else router.push('/auth');
  };

  // Hide the default sign-in button on auth pages
  const onAuthPage = pathname?.startsWith('/auth');

  // Show bell for authenticated buyers (or any non-seller for demo purposes)
  const showBell = !onAuthPage && role !== null && role !== 'seller';

  return (
    <>
      <style>{`
        @keyframes bellRing {
          0%,100% { transform: rotate(0deg); }
          15%      { transform: rotate(15deg); }
          30%      { transform: rotate(-12deg); }
          45%      { transform: rotate(10deg); }
          60%      { transform: rotate(-8deg); }
          75%      { transform: rotate(5deg); }
        }
        @keyframes notifPanelSlide {
          from { transform: translateY(-10px) scale(0.97); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes notifFadeIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes badgePop {
          0%   { transform: scale(0); }
          70%  { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Toast container – renders on every page via Navbar */}
      <ToastContainer />

      {/* ── Top App Bar ── */}
      <header className="bg-beige border-b border-gray-200 sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-container mx-auto">

          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-primary-container flex items-center gap-2 shrink-0">
            <span className="material-symbols-outlined">eco</span>
            EcoCycle AI
          </Link>

          {/* Desktop Nav — seller portal links only */}
          {isSellerPage && (
            <nav className="hidden md:flex gap-1 items-center">
              {sellerNavLinks.map(({ href, label, icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 font-semibold tracking-tight transition-all px-3 py-2 rounded-lg text-sm ${
                      active
                        ? 'text-primary bg-primary-fixed/40'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{icon}</span>
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right CTA */}
          {!onAuthPage && (
            <div className="hidden md:flex items-center gap-3">
              {role ? (
                /* Authenticated state */
                <div className="flex items-center gap-3">
                  {/* 🔔 Notification Bell – shown for buyer role */}
                  {showBell && <NotificationBell />}

                  <Link
                    href="/profile"
                    title="View Profile"
                    className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold uppercase hover:opacity-90 transition-opacity ring-2 ring-transparent hover:ring-primary/40"
                  >
                    {initials}
                  </Link>
                </div>
              ) : (
                /* Unauthenticated state */
                <button
                  onClick={handleSignIn}
                  className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-primary/20 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">login</span>
                  Sign In
                </button>
              )}
            </div>
          )}

          {/* Mobile hamburger (visible only when no role) */}
          <div className="md:hidden flex items-center gap-2">
            {!role && !onAuthPage && (
              <button
                onClick={handleSignIn}
                className="bg-primary text-white px-4 py-2 rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
              >
                Sign In
              </button>
            )}
            {role && (
              <div className="flex items-center gap-2">
                {/* 🔔 Mobile Bell */}
                {showBell && <NotificationBell />}
                <Link
                  href="/profile"
                  title="View Profile"
                  className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold uppercase hover:opacity-90 transition-opacity"
                >
                  {initials}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Public mobile bottom nav removed */}

      {/* ── Mobile Seller Bottom Nav ── */}
      {isSellerPage && (
        <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 bg-white/90 backdrop-blur-md z-50 border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          {sellerNavLinks.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center transition-all ${
                  active ? 'text-primary scale-110' : 'text-gray-400 hover:text-primary'
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {icon}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5">{label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
