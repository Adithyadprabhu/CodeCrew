'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { loginUser, getUser } from '@/services/index.js';

export default function SellerSignInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const cred = await loginUser(form.email, form.password);
      const userDoc = await getUser(cred.user.uid);
      if (userDoc?.role === 'buyer') {
        router.push('/market');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Sign-in error:', error.code, error.message);
      let msg = 'Sign in failed. Please try again.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        msg = 'Invalid email or password';
      }
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100dvh-80px)] flex items-center justify-center px-4 pb-24 md:pb-0">
        <div className="w-full max-w-md">

          {/* Role badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary-fixed text-on-primary-fixed-variant px-4 py-2 rounded-full text-sm font-bold">
              <span className="material-symbols-outlined text-sm">storefront</span>
              Seller Account
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-gray-100 p-8 md:p-10">
            <div className="mb-8">
              <h1 className="text-h2 font-bold text-on-background tracking-tight mb-2">
                Welcome back
              </h1>
              <p className="text-body-md text-on-surface-variant">
                Sign in to manage your listings and track earnings.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm font-medium">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-secondary uppercase tracking-widest block">
                  Corporate Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                    mail
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="seller@company.com"
                    autoComplete="email"
                    className="w-full pl-11 pr-4 py-3.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none text-body-md"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-secondary uppercase tracking-widest block">
                    Access Key
                  </label>
                  <a href="#" className="text-[11px] font-semibold text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                    lock
                  </span>
                  <input
                    type={showPw ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-11 pr-12 py-3.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none text-body-md"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors text-[20px]"
                  >
                    {showPw ? 'visibility_off' : 'visibility'}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-3">
                <input
                  id="remember-seller"
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                />
                <label htmlFor="remember-seller" className="text-sm text-secondary">
                  Stay authenticated for 30 days
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-xl font-semibold shadow-sm hover:shadow-md hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In as Seller
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-xs text-on-surface-variant">or</span>
              </div>
            </div>

            {/* Switch role */}
            <Link
              href="/auth/buyer"
              className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-outline-variant text-secondary font-semibold rounded-xl hover:border-primary hover:text-primary transition-all group"
            >
              <span className="material-symbols-outlined text-sm group-hover:rotate-12 transition-transform">
                shopping_basket
              </span>
              Switch to Buyer Sign In
            </Link>

            <p className="text-center text-sm text-on-surface-variant mt-6">
              New to EcoCycle?{' '}
              <Link href="/auth/register" className="text-primary font-semibold hover:underline">
                Create seller account
              </Link>
            </p>
          </div>

          {/* Back to role selection */}
          <div className="text-center mt-6">
            <Link
              href="/auth"
              className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to role selection
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
