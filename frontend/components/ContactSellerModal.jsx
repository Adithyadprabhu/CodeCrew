'use client';
import { useState } from 'react';

/* ── Field helper (module scope — avoids remount bug) ─────────── */
function Field({ label, id, error, required, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[10px] font-bold text-outline uppercase tracking-widest block">
        {label}{required && <span className="text-error ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-error text-xs flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{error}</p>}
    </div>
  );
}

/* ── Toast ────────────────────────────────────────────────────── */
function Toast({ msg, onClose }) {
  return (
    <div className="fixed top-6 right-6 z-[400] flex items-center gap-3 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl font-semibold text-sm animate-[slideIn_0.3s_ease]">
      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      {msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
}

/* ── Main Modal ───────────────────────────────────────────────── */
export default function ContactSellerModal({ item, onClose, onSent }) {
  const [form, setForm] = useState({
    buyerName: '', phone: '', email: '', quantity: '', offeredPrice: '', message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inputCls = (err) =>
    `w-full px-4 py-3 rounded-xl border ${err ? 'border-error ring-1 ring-error' : 'border-outline-variant'} focus:ring-2 focus:ring-primary focus:border-primary bg-background outline-none transition-all text-sm font-medium`;

  const validate = () => {
    const e = {};
    if (!form.buyerName.trim())             e.buyerName = 'Required';
    if (!/^\d{10}$/.test(form.phone))       e.phone = '10-digit number required';
    if (!form.email.includes('@'))          e.email = 'Valid email required';
    if (!form.quantity.trim())              e.quantity = 'Required';
    if (!form.message.trim())              e.message = 'Please add a message';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
    setTimeout(() => {
      onSent?.();
      onClose();
    }, 2500);
  };

  return (
    <>
      <style>{`
        @keyframes slideIn { from { transform:translateX(120%); opacity:0; } to { transform:translateX(0); opacity:1; } }
        @keyframes fadeUp  { from { transform:translateY(24px); opacity:0; } to { transform:translateY(0); opacity:1; } }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[250] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-[fadeUp_0.25s_cubic-bezier(.34,1.56,.64,1)]"
          onClick={e => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-surface-container sticky top-0 bg-white rounded-t-3xl z-10">
            <div>
              <h2 className="text-lg font-bold text-on-surface">Contact Seller</h2>
              <p className="text-xs text-secondary mt-0.5">Send a purchase request directly to the seller</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-container rounded-xl transition-all text-secondary hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {!submitted ? (
            <>
              {/* ── Product Summary ── */}
              <div className="mx-6 mt-5 rounded-2xl overflow-hidden border border-surface-container flex flex-col sm:flex-row gap-0">
                <div className="sm:w-36 h-32 sm:h-auto flex-shrink-0">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 p-4 bg-surface-container-low">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-full">{item.tag}</span>
                  <h3 className="font-bold text-on-surface mt-2 mb-1">{item.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-bold text-primary text-lg">{item.price} <span className="text-xs text-outline font-normal">/ tonne</span></span>
                    <span className="flex items-center gap-1 text-secondary">
                      <span className="material-symbols-outlined text-sm">location_on</span>{item.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-secondary">
                    <span><strong className="text-on-surface">{item.qty}</strong> available</span>
                    <span className={item.detailColor}>{item.detailLabel} <strong>{item.detail}</strong></span>
                  </div>
                </div>
              </div>

              {/* ── Seller Info ── */}
              <div className="mx-6 mt-4 p-4 rounded-2xl border border-surface-container bg-white flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                  {item.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-on-surface">EcoCycle Verified Seller</p>
                  <p className="text-xs text-secondary">{item.location}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-500 flex-shrink-0">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-sm font-bold text-on-surface">4.8</span>
                  <span className="text-xs text-secondary">(42)</span>
                </div>
              </div>

              {/* ── Request Form ── */}
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4" noValidate>
                <div className="mb-2">
                  <p className="text-xs font-bold text-outline uppercase tracking-widest">Your Details</p>
                </div>

                {/* Name */}
                <Field label="Your Name" id="cs-name" error={errors.buyerName} required>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">person</span>
                    <input id="cs-name" value={form.buyerName} onChange={e => set('buyerName', e.target.value)}
                      placeholder="John Doe" className={`${inputCls(errors.buyerName)} pl-10`} />
                  </div>
                </Field>

                {/* Phone + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Phone" id="cs-phone" error={errors.phone} required>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">phone</span>
                      <input id="cs-phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                        placeholder="9876543210" className={`${inputCls(errors.phone)} pl-10`} />
                    </div>
                  </Field>
                  <Field label="Email" id="cs-email" error={errors.email} required>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">mail</span>
                      <input id="cs-email" type="email" value={form.email} onChange={e => set('email', e.target.value)}
                        placeholder="you@email.com" className={`${inputCls(errors.email)} pl-10`} />
                    </div>
                  </Field>
                </div>

                <div className="pt-1 mb-2">
                  <p className="text-xs font-bold text-outline uppercase tracking-widest">Request Details</p>
                </div>

                {/* Quantity + Offered Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Quantity Required" id="cs-qty" error={errors.quantity} required>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">scale</span>
                      <input id="cs-qty" value={form.quantity} onChange={e => set('quantity', e.target.value)}
                        placeholder="e.g. 5 Tonnes" className={`${inputCls(errors.quantity)} pl-10`} />
                    </div>
                  </Field>
                  <Field label="Offered Price (optional)" id="cs-price">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-bold text-sm">₹</span>
                      <input id="cs-price" type="number" value={form.offeredPrice} onChange={e => set('offeredPrice', e.target.value)}
                        placeholder={item.price.replace('$', '')} className={`${inputCls(false)} pl-8`} />
                    </div>
                  </Field>
                </div>

                {/* Message */}
                <Field label="Message to Seller" id="cs-msg" error={errors.message} required>
                  <textarea id="cs-msg" rows={3} value={form.message} onChange={e => set('message', e.target.value)}
                    placeholder="Describe your requirements, delivery preference, quality expectations…"
                    className={`${inputCls(errors.message)} resize-none`} />
                </Field>

                {/* Suggested price hint */}
                <div className="flex items-start gap-2 bg-primary-fixed/30 rounded-xl p-3 text-sm">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">lightbulb</span>
                  <p className="text-secondary leading-relaxed">
                    Listed price is <strong className="text-primary">{item.price}/tonne</strong>.
                    You can negotiate by entering your offered price above.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-3 border-t border-surface-container">
                  <button type="button" onClick={onClose}
                    className="flex-1 py-3.5 border border-outline-variant text-secondary rounded-xl font-semibold hover:border-primary hover:text-primary transition-all text-sm">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-[2] py-3.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-sm">send</span>
                    Send Request
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* ── Success State ── */
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-[fadeUp_0.35s_ease]">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-green-600 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">Request Sent!</h3>
              <p className="text-secondary text-sm mb-1">Your purchase request has been sent to the seller.</p>
              <p className="text-secondary text-sm">They typically respond within <strong className="text-on-surface">24 hours</strong>.</p>
              <div className="mt-6 flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2.5 rounded-xl text-sm font-semibold">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
                Status: Pending Seller Response
              </div>
              <p className="text-xs text-outline mt-6">Closing automatically…</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
