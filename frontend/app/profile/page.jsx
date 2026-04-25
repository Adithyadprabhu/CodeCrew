'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { observeAuthState, getUser, updateUser } from '@/services/index.js';

/* ── helpers at module scope ─────────────────────────────────── */
function Field({ label, id, error, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[10px] font-bold text-outline uppercase tracking-widest block">{label}</label>
      {children}
      {error && <p className="text-error text-xs flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{error}</p>}
    </div>
  );
}

function Toast({ msg, type = 'success', onClose }) {
  const bg = type === 'error' ? 'bg-error' : 'bg-green-600';
  return (
    <div className={`fixed top-6 right-6 z-[300] flex items-center gap-3 ${bg} text-white px-6 py-4 rounded-2xl shadow-2xl font-semibold text-sm animate-[slideIn_0.3s_ease]`}>
      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{type === 'error' ? 'error' : 'check_circle'}</span>
      {msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><span className="material-symbols-outlined text-sm">close</span></button>
    </div>
  );
}

const TABS = ['Overview', 'Activity', 'Settings'];

const BUYER_ACTIVITY = [
  { icon: 'shopping_basket', label: 'Requested Baled Clear PET',      sub: 'Portland, OR',    date: 'Apr 22, 2026', status: 'pending',  statusColor: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { icon: 'check_circle',    label: 'Purchased OCC Baled Cardboard',  sub: 'Beaverton, OR',   date: 'Apr 18, 2026', status: 'accepted', statusColor: 'bg-green-50 text-green-700 border-green-200'   },
  { icon: 'cancel',          label: 'Rejected — Shredded UBC',        sub: 'Seattle, WA',     date: 'Apr 10, 2026', status: 'rejected', statusColor: 'bg-red-50 text-red-700 border-red-200'         },
];
const SELLER_ACTIVITY = [
  { icon: 'inventory_2',  label: 'Listed Clear PET Pellets',          sub: '500 kg · ₹9,500',  date: 'Apr 22, 2026', status: 'active',   statusColor: 'bg-green-50 text-green-700 border-green-200'   },
  { icon: 'inbox',        label: 'Accepted request — GreenMart',      sub: '2 Tonnes · ₹36,000',date: 'Apr 20, 2026', status: 'accepted', statusColor: 'bg-green-50 text-green-700 border-green-200'   },
  { icon: 'cancel',       label: 'Rejected request — Waste Warriors', sub: '300 kg · ₹1,200',  date: 'Apr 15, 2026', status: 'rejected', statusColor: 'bg-red-50 text-red-700 border-red-200'         },
];

/* ── Main Page ───────────────────────────────────────────────── */
export default function ProfilePage() {
  const router  = useRouter();
  const fileRef = useRef();

  const [activeTab, setActiveTab] = useState('Overview');
  const [editing, setEditing]     = useState(false);
  const [toast, setToast]         = useState(null);
  const [avatar, setAvatar]       = useState(null);   // data-URL
  const [errors, setErrors]       = useState({});
  const [userAuth, setUserAuth]   = useState(null);

  const [user, setUser] = useState({
    name: 'Loading...', email: '', role: 'buyer',
    phone: '', company: '', location: '',
    bio: '',
  });

  /* Load from Firebase */
  useEffect(() => {
    const unsub = observeAuthState(async (authUser) => {
      if (authUser) {
        setUserAuth(authUser);
        try {
          const uData = await getUser(authUser.uid);
          if (uData) {
            const fetchedUser = {
              name: uData.fullName || uData.name || 'User',
              email: uData.email || authUser.email || '',
              role: uData.role || 'buyer',
              phone: uData.phone || '',
              company: uData.company || '',
              location: uData.location || '',
              bio: uData.bio || 'Passionate about building a cleaner circular economy.',
            };
            setUser(fetchedUser);
            // Keep local storage in sync for other components if needed
            localStorage.setItem('ecocycle_role', fetchedUser.role);
            localStorage.setItem('ecocycle_user', JSON.stringify(fetchedUser));
          }
        } catch (error) {
          console.error('Error fetching profile data:', error);
        }
      } else {
        router.push('/auth');
      }
      
      const av = localStorage.getItem('ecocycle_avatar');
      if (av) setAvatar(av);
    });
    return () => unsub();
  }, [router]);

  const isSeller = user.role === 'seller';
  const activity = isSeller ? SELLER_ACTIVITY : BUYER_ACTIVITY;

  /* Form state (separate from display so cancel works) */
  const [form, setForm] = useState(null);
  const startEdit = () => { setForm({ ...user }); setEditing(true); setErrors({}); };
  const cancelEdit = () => { setEditing(false); setForm(null); setErrors({}); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inputCls = (err) =>
    `w-full px-4 py-3 rounded-xl border ${err ? 'border-error ring-1 ring-error' : 'border-outline-variant'} focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none transition-all text-sm font-medium`;

  const validate = () => {
    const e = {};
    if (!form.name.trim())                              e.name  = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveProfile = async () => {
    if (!validate()) return;
    try {
      if (userAuth) {
        await updateUser(userAuth.uid, {
          fullName: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          location: form.location,
          bio: form.bio,
        });
      }
      setUser(form);
      localStorage.setItem('ecocycle_user', JSON.stringify(form));
      setEditing(false);
      setForm(null);
      showToast('✅ Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('❌ Error updating profile', 'error');
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatar(ev.target.result);
      localStorage.setItem('ecocycle_avatar', ev.target.result);
      showToast('📸 Profile photo updated!');
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    localStorage.removeItem('ecocycle_user');
    localStorage.removeItem('ecocycle_role');
    localStorage.removeItem('ecocycle_avatar');
    router.push('/auth');
  };

  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  /* ── Stats ── */
  const stats = isSeller
    ? [
        { icon: 'inventory_2',  label: 'Total Listings',  value: '12',  sub: '3 active',    color: 'bg-primary-fixed text-primary'        },
        { icon: 'payments',     label: 'Revenue',          value: '₹1.2L', sub: 'this month', color: 'bg-secondary-container text-secondary' },
        { icon: 'inbox',        label: 'Requests',         value: '28',  sub: '5 pending',   color: 'bg-blue-50 text-blue-600'              },
        { icon: 'star',         label: 'Rating',           value: '4.8', sub: '(42 reviews)',color: 'bg-amber-50 text-amber-500'            },
      ]
    : [
        { icon: 'shopping_basket', label: 'Requests Made',    value: '14',  sub: '2 pending',   color: 'bg-primary-fixed text-primary'        },
        { icon: 'check_circle',    label: 'Purchases',        value: '9',   sub: 'completed',   color: 'bg-green-50 text-green-600'           },
        { icon: 'payments',        label: 'Total Spent',      value: '₹84K',sub: 'all time',    color: 'bg-secondary-container text-secondary' },
        { icon: 'star',            label: 'Rating',           value: '4.6', sub: '(18 reviews)',color: 'bg-amber-50 text-amber-500'            },
      ];

  return (
    <>
      <style>{`
        @keyframes slideIn { from { transform:translateX(120%); opacity:0; } to { transform:translateX(0); opacity:1; } }
        @keyframes fadeUp  { from { transform:translateY(20px); opacity:0; } to { transform:translateY(0); opacity:1; } }
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

      <Navbar />
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-10 pb-32 md:pb-14 min-h-screen">

        {/* ── Profile Header Card ── */}
        <div className="bg-white rounded-3xl border border-surface-container shadow-sm overflow-hidden mb-6 animate-[fadeUp_0.3s_ease]">
          {/* Banner gradient */}
          <div className="h-28 bg-gradient-to-br from-primary via-primary/80 to-tertiary relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
              {/* Avatar */}
              <div className="relative w-fit">
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-primary flex items-center justify-center">
                  {avatar
                    ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                    : <span className="text-white text-2xl font-bold">{initials}</span>}
                </div>
                <button
                  onClick={() => fileRef.current.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border border-outline-variant rounded-xl flex items-center justify-center shadow hover:bg-surface-container transition-all"
                  title="Change photo"
                >
                  <span className="material-symbols-outlined text-sm text-secondary">photo_camera</span>
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap sm:mb-1">
                {!editing && (
                  <button onClick={startEdit}
                    className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-xl font-semibold text-sm hover:bg-primary-fixed/40 transition-all">
                    <span className="material-symbols-outlined text-sm">edit</span>Edit Profile
                  </button>
                )}
                <button onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 border border-error/40 text-error rounded-xl font-semibold text-sm hover:bg-error-container/20 transition-all">
                  <span className="material-symbols-outlined text-sm">logout</span>Logout
                </button>
              </div>
            </div>

            {/* Name + role + bio */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-on-surface">{user.name}</h1>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest
                  ${isSeller ? 'bg-primary text-white' : 'bg-secondary-container text-on-secondary-container'}`}>
                  {isSeller ? '🏭 Seller' : '🛒 Buyer'}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>Verified
                </span>
              </div>
              {user.location && (
                <p className="text-sm text-secondary flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-sm">location_on</span>{user.location}
                </p>
              )}
              <p className="text-sm text-secondary leading-relaxed">{user.bio}</p>
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-surface-container shadow-sm p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${s.color} flex-shrink-0`}>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-on-surface leading-tight">{s.value}</p>
                <p className="text-[10px] font-bold text-outline uppercase tracking-widest truncate">{s.label}</p>
                <p className="text-[10px] text-secondary">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-surface-container p-1.5 rounded-2xl mb-6 w-fit">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all
                ${activeTab === t ? 'bg-white text-primary shadow-sm' : 'text-secondary hover:text-on-surface'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* ════ OVERVIEW TAB ════ */}
        {activeTab === 'Overview' && (
          <div className="bg-white rounded-2xl border border-surface-container shadow-sm p-6 animate-[fadeUp_0.25s_ease]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-on-surface">Personal Details</h2>
              {!editing
                ? <button onClick={startEdit} className="text-primary text-sm font-semibold hover:opacity-70 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">edit</span>Edit
                  </button>
                : <div className="flex gap-2">
                    <button onClick={cancelEdit} className="px-4 py-1.5 border border-outline-variant text-secondary rounded-xl text-sm font-semibold hover:border-primary hover:text-primary transition-all">Cancel</button>
                    <button onClick={saveProfile} className="px-4 py-1.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all">Save Changes</button>
                  </div>}
            </div>

            {!editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { icon: 'person',       label: 'Full Name',    value: user.name     },
                  { icon: 'mail',         label: 'Email',        value: user.email    },
                  { icon: 'phone',        label: 'Phone',        value: user.phone || '—' },
                  { icon: 'business',     label: 'Company',      value: user.company || '—' },
                  { icon: 'location_on',  label: 'Location',     value: user.location || '—' },
                  { icon: 'badge',        label: 'Role',         value: isSeller ? 'Seller' : 'Buyer' },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-all">
                    <div className="w-9 h-9 bg-primary-fixed rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-primary text-sm">{icon}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest">{label}</p>
                      <p className="text-sm font-semibold text-on-surface mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Full Name" id="p-name" error={errors.name}>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">person</span>
                      <input id="p-name" value={form.name} onChange={e => set('name', e.target.value)}
                        className={`${inputCls(errors.name)} pl-10`} />
                    </div>
                  </Field>
                  <Field label="Email" id="p-email" error={errors.email}>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">mail</span>
                      <input id="p-email" type="email" value={form.email} onChange={e => set('email', e.target.value)}
                        className={`${inputCls(errors.email)} pl-10`} />
                    </div>
                  </Field>
                  <Field label="Phone" id="p-phone">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">phone</span>
                      <input id="p-phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                        placeholder="9876543210" className={`${inputCls(false)} pl-10`} />
                    </div>
                  </Field>
                  <Field label="Company (optional)" id="p-company">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">business</span>
                      <input id="p-company" value={form.company} onChange={e => set('company', e.target.value)}
                        placeholder="Your company" className={`${inputCls(false)} pl-10`} />
                    </div>
                  </Field>
                  <Field label="Location" id="p-loc">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">location_on</span>
                      <input id="p-loc" value={form.location} onChange={e => set('location', e.target.value)}
                        placeholder="City, State" className={`${inputCls(false)} pl-10`} />
                    </div>
                  </Field>
                  <Field label="Bio" id="p-bio">
                    <textarea id="p-bio" rows={2} value={form.bio} onChange={e => set('bio', e.target.value)}
                      className={`${inputCls(false)} resize-none`} />
                  </Field>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ ACTIVITY TAB ════ */}
        {activeTab === 'Activity' && (
          <div className="bg-white rounded-2xl border border-surface-container shadow-sm overflow-hidden animate-[fadeUp_0.25s_ease]">
            <div className="px-6 py-5 border-b border-surface-container">
              <h2 className="font-bold text-on-surface">Recent Activity</h2>
              <p className="text-xs text-secondary mt-0.5">{isSeller ? 'Listings and buyer requests' : 'Your requests and purchases'}</p>
            </div>
            <div className="divide-y divide-surface-container">
              {activity.map((a, i) => (
                <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-surface-container-low transition-all">
                  <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-primary text-sm">{a.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-on-surface truncate">{a.label}</p>
                    <p className="text-xs text-secondary">{a.sub} · {a.date}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-widest flex-shrink-0 ${a.statusColor}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ SETTINGS TAB ════ */}
        {activeTab === 'Settings' && (
          <div className="space-y-4 animate-[fadeUp_0.25s_ease]">
            {/* Notifications */}
            <div className="bg-white rounded-2xl border border-surface-container shadow-sm p-6">
              <h2 className="font-bold text-on-surface mb-4">Notifications</h2>
              <div className="space-y-3">
                {[
                  { label: 'Email notifications',    sub: 'Receive updates via email'    },
                  { label: 'Request alerts',         sub: 'Notify on new buyer requests' },
                  { label: 'Price change alerts',    sub: 'Alert when listing prices change' },
                ].map((n, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-all">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{n.label}</p>
                      <p className="text-xs text-secondary">{n.sub}</p>
                    </div>
                    <button className="w-11 h-6 bg-primary rounded-full relative flex-shrink-0">
                      <span className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
              <h2 className="font-bold text-error mb-1">Danger Zone</h2>
              <p className="text-xs text-secondary mb-4">These actions are permanent and cannot be undone.</p>
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 border border-error/40 text-error rounded-xl font-semibold text-sm hover:bg-error-container/20 transition-all">
                  <span className="material-symbols-outlined text-sm">delete_forever</span>Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
      <Footer />
    </>
  );
}
