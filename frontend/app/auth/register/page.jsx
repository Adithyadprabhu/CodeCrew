'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { signupUser, addUser } from '@/services/index.js';

/* ── Password strength ───────────────────────────────────────── */
function strength(pw) {
  let score = 0;
  if (pw.length >= 8)             score++;
  if (/[A-Z]/.test(pw))          score++;
  if (/[0-9]/.test(pw))          score++;
  if (/[^A-Za-z0-9]/.test(pw))   score++;
  return score; // 0-4
}
const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLOR = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
const STRENGTH_TEXT  = ['', 'text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600'];

/* ── Field wrapper (module scope!) ──────────────────────────── */
function Field({ label, id, error, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[10px] font-bold text-outline uppercase tracking-widest block">{label}</label>
      {children}
      {error && (
        <p className="text-error text-xs flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">error</span>{error}
        </p>
      )}
    </div>
  );
}

/* ── Toast ───────────────────────────────────────────────────── */
function Toast({ msg, onClose }) {
  return (
    <div className="fixed top-6 right-6 z-[300] flex items-center gap-3 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl font-semibold text-sm animate-[slideIn_0.3s_ease]">
      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      {msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState('buyer');
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [toast, setToast]     = useState(null);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    company: '', location: '', businessType: '', phone: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inputCls = (err) =>
    `w-full px-4 py-3.5 rounded-xl border ${err ? 'border-error ring-1 ring-error' : 'border-outline-variant'} focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none transition-all text-sm font-medium`;


  const validate = () => {
    const e = {};
    if (!form.fullName.trim())                     e.fullName = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (form.password.length < 6)                  e.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword)    e.confirmPassword = 'Passwords do not match';
    if (!form.location.trim())                     e.location = 'Required';
    if (role === 'seller') {
      if (!form.company.trim())                    e.company = 'Required for sellers';
      if (!/^\d{10}$/.test(form.phone))            e.phone = '10-digit number required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const cred = await signupUser(form.email, form.password);
      await addUser(cred.user.uid, form.fullName, form.email, role);
      setLoading(false);
      setToast('🎉 Account created successfully!');
      router.push(role === 'seller' ? '/dashboard' : '/market');
    } catch (error) {
      console.error(error);
      setLoading(false);
      setErrors({ email: error.message });
    }
  };

  const pwScore = strength(form.password);

  return (
    <>
      <style>{`
        @keyframes slideIn { from { transform:translateX(120%); opacity:0; } to { transform:translateX(0); opacity:1; } }
        @keyframes fadeUp  { from { transform:translateY(20px); opacity:0; } to { transform:translateY(0); opacity:1; } }
      `}</style>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      <Navbar />
      <main className="min-h-[calc(100dvh-80px)] flex items-start justify-center px-4 py-12 pb-32 md:pb-12">
        <div className="w-full max-w-lg animate-[fadeUp_0.35s_ease]">

          {/* ── Header ── */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-fixed mb-4">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">EcoCycle AI</p>
            <h1 className="text-2xl font-bold text-on-background tracking-tight">Create your account</h1>
            <p className="text-sm text-secondary mt-1">Join the circular economy today</p>
          </div>

          {/* ── Role Selector ── */}
          <div className="grid grid-cols-2 gap-3 mb-6 bg-surface-container p-1.5 rounded-2xl">
            {[
              { key: 'buyer',  icon: 'shopping_basket', label: 'Buyer',  sub: 'Source materials' },
              { key: 'seller', icon: 'storefront',      label: 'Seller', sub: 'List materials'   },
            ].map(r => (
              <button
                key={r.key}
                type="button"
                onClick={() => { setRole(r.key); setErrors({}); }}
                className={`flex items-center gap-3 p-3.5 rounded-xl transition-all font-semibold text-left
                  ${role === r.key
                    ? 'bg-white shadow-sm text-primary border border-primary/20'
                    : 'text-secondary hover:text-on-surface'}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                  ${role === r.key ? 'bg-primary-fixed' : 'bg-surface-container-low'}`}>
                  <span className="material-symbols-outlined text-sm">{r.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">{r.label}</p>
                  <p className="text-[10px] text-secondary font-normal">{r.sub}</p>
                </div>
                {role === r.key && (
                  <span className="material-symbols-outlined text-primary ml-auto text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                )}
              </button>
            ))}
          </div>

          {/* ── Form Card ── */}
          <div className="bg-white rounded-2xl border border-surface-container shadow-sm p-6 md:p-8">

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* ── Common fields ── */}
              <Field label="Full Name" id="r-name" error={errors.fullName}>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">person</span>
                  <input id="r-name" value={form.fullName} onChange={e => set('fullName', e.target.value)}
                    placeholder="John Doe" className={`${inputCls(errors.fullName)} pl-10`} />
                </div>
              </Field>

              <Field label="Email Address" id="r-email" error={errors.email}>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">mail</span>
                  <input id="r-email" type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="you@example.com" className={`${inputCls(errors.email)} pl-10`} />
                </div>
              </Field>

              {/* Password */}
              <Field label="Password" id="r-pw" error={errors.password}>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">lock</span>
                  <input id="r-pw" type={showPw ? 'text' : 'password'} value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Min. 6 characters" className={`${inputCls(errors.password)} pl-10 pr-10`} />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined text-sm">{showPw ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {/* Strength bar */}
                {form.password && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= pwScore ? STRENGTH_COLOR[pwScore] : 'bg-surface-container'}`} />
                      ))}
                    </div>
                    <p className={`text-[10px] font-semibold ${STRENGTH_TEXT[pwScore]}`}>{STRENGTH_LABEL[pwScore]}</p>
                  </div>
                )}
              </Field>

              <Field label="Confirm Password" id="r-cpw" error={errors.confirmPassword}>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">lock</span>
                  <input id="r-cpw" type={showCpw ? 'text' : 'password'} value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    placeholder="Repeat password" className={`${inputCls(errors.confirmPassword)} pl-10 pr-10`} />
                  <button type="button" onClick={() => setShowCpw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined text-sm">{showCpw ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </Field>

              {/* ── Buyer extras ── */}
              {role === 'buyer' && (
                <>
                  <Field label="Company Name (optional)" id="r-company">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">business</span>
                      <input id="r-company" value={form.company} onChange={e => set('company', e.target.value)}
                        placeholder="Your company" className={`${inputCls(false)} pl-10`} />
                    </div>
                  </Field>
                  <Field label="Location" id="r-loc" error={errors.location}>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">location_on</span>
                      <input id="r-loc" value={form.location} onChange={e => set('location', e.target.value)}
                        placeholder="City, State" className={`${inputCls(errors.location)} pl-10`} />
                    </div>
                  </Field>
                </>
              )}

              {/* ── Seller extras ── */}
              {role === 'seller' && (
                <>
                  <Field label="Company Name" id="r-company" error={errors.company}>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">business</span>
                      <input id="r-company" value={form.company} onChange={e => set('company', e.target.value)}
                        placeholder="Your company name" className={`${inputCls(errors.company)} pl-10`} />
                    </div>
                  </Field>
                  <Field label="Business Type" id="r-btype">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">category</span>
                      <select id="r-btype" value={form.businessType} onChange={e => set('businessType', e.target.value)}
                        className={`${inputCls(false)} pl-10 appearance-none`}>
                        <option value="">Select type…</option>
                        <option>Plastic Recycler</option>
                        <option>Metal Scrap Dealer</option>
                        <option>Paper / Cardboard</option>
                        <option>Glass Recycler</option>
                        <option>E-Waste Processor</option>
                        <option>Organic Waste Handler</option>
                        <option>Multi-Material</option>
                      </select>
                    </div>
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Phone" id="r-phone" error={errors.phone}>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">phone</span>
                        <input id="r-phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                          placeholder="9876543210" className={`${inputCls(errors.phone)} pl-10`} />
                      </div>
                    </Field>
                    <Field label="Location" id="r-loc" error={errors.location}>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">location_on</span>
                        <input id="r-loc" value={form.location} onChange={e => set('location', e.target.value)}
                          placeholder="City, State" className={`${inputCls(errors.location)} pl-10`} />
                      </div>
                    </Field>
                  </div>
                </>
              )}

              {/* ── Submit ── */}
              <button type="submit" disabled={loading}
                className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-60 mt-2">
                {loading ? (
                  <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account…</>
                ) : (
                  <><span className="material-symbols-outlined text-sm">how_to_reg</span>Register as {role === 'buyer' ? 'Buyer' : 'Seller'}</>
                )}
              </button>
            </form>
          </div>

          {/* ── Footer links ── */}
          <p className="text-center text-sm text-secondary mt-5">
            Already have an account?{' '}
            <Link href="/auth" className="text-primary font-semibold hover:underline">Sign In</Link>
          </p>
          <p className="text-center text-xs text-outline mt-3">
            By registering you agree to our{' '}
            <a href="#" className="hover:underline text-secondary">Terms of Service</a> &amp;{' '}
            <a href="#" className="hover:underline text-secondary">Privacy Policy</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
