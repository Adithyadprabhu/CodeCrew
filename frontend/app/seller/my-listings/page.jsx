'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getListings, saveListings } from '@/lib/listingsStore';

const STATUS_STYLE = {
  ACTIVE:  'bg-green-50 text-green-700 border-green-200',
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  DRAFT:   'bg-gray-100 text-gray-600 border-gray-200',
};

/* ─── Toast ─────────────────────────────────────────────────── */
function Toast({ msg, type = 'success', onClose }) {
  return (
    <div className={`fixed top-6 right-6 z-[300] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-semibold text-sm ${type === 'error' ? 'bg-error' : 'bg-primary'} animate-[slideIn_0.3s_ease]`}>
      <span className="material-symbols-outlined">{type === 'error' ? 'error' : 'check_circle'}</span>
      {msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
}

/* ─── Delete Modal ───────────────────────────────────────────── */
function DeleteModal({ listing, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-[fadeUp_0.25s_ease]">
        <div className="w-14 h-14 bg-error-container rounded-2xl flex items-center justify-center mx-auto mb-5">
          <span className="material-symbols-outlined text-error text-2xl">delete_forever</span>
        </div>
        <h2 className="text-xl font-bold text-on-surface text-center mb-2">Delete Listing?</h2>
        <p className="text-secondary text-sm text-center mb-1">Are you sure you want to delete</p>
        <p className="font-bold text-on-surface text-center mb-3">"{listing.name}"?</p>
        <p className="text-xs text-outline text-center mb-8">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 border border-outline-variant text-secondary rounded-xl font-semibold hover:border-primary hover:text-primary transition-all">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-3 bg-error text-white rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">delete</span>Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Edit Modal ─────────────────────────────────────────────── */
function EditModal({ listing, onCancel, onSave }) {
  const [form, setForm] = useState({ ...listing });
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name?.trim())                       e.name = 'Required';
    if (!form.quantity || isNaN(+form.quantity))  e.quantity = 'Valid number required';
    if (!form.price || isNaN(+form.price))        e.price = 'Valid price required';
    if (!/^\d{10}$/.test(form.phone))             e.phone = '10-digit number';
    if (!form.email?.includes('@'))               e.email = 'Valid email required';
    if (!form.location?.trim())                   e.location = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const inputCls = (err) => `w-full px-4 py-3 rounded-xl border ${err ? 'border-error ring-1 ring-error' : 'border-outline-variant'} focus:ring-2 focus:ring-primary focus:border-primary bg-background outline-none transition-all text-sm font-medium`;
  const Field = ({ label, id, error, children }) => (
    <div className="space-y-1">
      <label htmlFor={id} className="text-[10px] font-bold text-outline uppercase tracking-widest block">{label}</label>
      {children}
      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-[fadeUp_0.25s_ease]">
        <div className="flex items-center justify-between p-6 border-b border-surface-container sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Edit Listing</h2>
            <p className="text-xs text-secondary mt-0.5">ID #{listing.id} · Update your material details</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-surface-container rounded-xl transition-all text-secondary">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-5">
          <Field label="Material Name" id="e-name" error={errors.name}>
            <input id="e-name" value={form.name || ''} onChange={e => set('name', e.target.value)} className={inputCls(errors.name)} />
          </Field>
          <Field label="Material Type" id="e-mat">
            <input id="e-mat" value={form.material || ''} onChange={e => set('material', e.target.value)} className={inputCls(false)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Quantity" id="e-qty" error={errors.quantity}>
              <input id="e-qty" type="number" value={form.quantity || ''} onChange={e => set('quantity', e.target.value)} className={inputCls(errors.quantity)} />
            </Field>
            <Field label="Unit" id="e-unit">
              <select id="e-unit" value={form.unit || 'kg'} onChange={e => set('unit', e.target.value)} className={inputCls(false)}>
                <option value="kg">Kilograms (kg)</option>
                <option value="tons">Metric Tons</option>
                <option value="litres">Litres</option>
                <option value="pieces">Pieces</option>
              </select>
            </Field>
          </div>
          <Field label="Price (₹)" id="e-price" error={errors.price}>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-bold text-sm">₹</span>
              <input id="e-price" type="number" value={form.price || ''} onChange={e => set('price', e.target.value)} className={`${inputCls(errors.price)} pl-8`} />
            </div>
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Phone" id="e-phone" error={errors.phone}>
              <input id="e-phone" type="tel" value={form.phone || ''} onChange={e => set('phone', e.target.value)} className={inputCls(errors.phone)} />
            </Field>
            <Field label="Email" id="e-email" error={errors.email}>
              <input id="e-email" type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} className={inputCls(errors.email)} />
            </Field>
          </div>
          <Field label="Location" id="e-loc" error={errors.location}>
            <input id="e-loc" value={form.location || ''} onChange={e => set('location', e.target.value)} className={inputCls(errors.location)} />
          </Field>
          <Field label="Status" id="e-status">
            <select id="e-status" value={form.status || 'DRAFT'} onChange={e => set('status', e.target.value)} className={inputCls(false)}>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="DRAFT">Draft</option>
            </select>
          </Field>
          <Field label="Description" id="e-desc">
            <textarea id="e-desc" rows={3} value={form.description || ''} onChange={e => set('description', e.target.value)} className={`${inputCls(false)} resize-none`} />
          </Field>
        </div>
        <div className="flex gap-3 p-6 border-t border-surface-container sticky bottom-0 bg-white rounded-b-2xl">
          <button onClick={onCancel} className="flex-1 py-3.5 border border-outline-variant text-secondary rounded-xl font-semibold hover:border-primary hover:text-primary transition-all text-sm">Cancel</button>
          <button onClick={() => { if (validate()) onSave(form); }} className="flex-[2] py-3.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-sm">save</span>Update Listing
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Listing Card ───────────────────────────────────────────── */
function ListingCard({ item, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-2xl border border-surface-container shadow-sm p-5 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-md transition-all">
      <div className="w-14 h-14 rounded-xl bg-primary-fixed flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-primary">inventory_2</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="font-bold text-on-surface truncate">{item.name}</h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_STYLE[item.status] || STATUS_STYLE.DRAFT}`}>{item.status}</span>
        </div>
        <p className="text-sm text-secondary">{item.material} · {item.quantity} {item.unit} · AI {item.confidence || '—'}%</p>
        <p className="text-xs text-outline mt-1">{item.location} · {item.date}</p>
      </div>
      <div className="flex flex-col md:items-end gap-0.5 flex-shrink-0">
        <span className="text-xl font-bold text-primary">₹{Number(item.price || 0).toLocaleString('en-IN')}</span>
        <span className="text-xs text-secondary uppercase tracking-widest">Total value</span>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button onClick={() => onEdit(item)} title="Edit" className="p-2.5 text-secondary hover:text-primary hover:bg-primary-fixed/30 rounded-xl transition-all">
          <span className="material-symbols-outlined text-sm">edit</span>
        </button>
        <button onClick={() => onDelete(item)} title="Delete" className="p-2.5 text-secondary hover:text-error hover:bg-error-container/30 rounded-xl transition-all">
          <span className="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function MyListingsPage() {
  const router = useRouter();
  const [listings, setListings]     = useState([]);
  const [editTarget, setEditTarget] = useState(null);
  const [delTarget, setDelTarget]   = useState(null);
  const [toast, setToast]           = useState(null);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterMaterial, setFilterMaterial] = useState('ALL');

  /* Load from shared store on mount */
  useEffect(() => { setListings(getListings()); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* Edit */
  const handleSaveEdit = (updated) => {
    const next = listings.map(l => l.id === updated.id ? updated : l);
    setListings(next);
    saveListings(next);
    setEditTarget(null);
    showToast('✅ Listing updated successfully');
  };

  /* Delete */
  const handleConfirmDelete = () => {
    const next = listings.filter(l => l.id !== delTarget.id);
    setListings(next);
    saveListings(next);
    setDelTarget(null);
    showToast('🗑️ Listing deleted successfully');
  };

  /* Derived: unique material types for filter */
  const materialTypes = useMemo(() => {
    const types = [...new Set(listings.map(l => l.material).filter(Boolean))];
    return types;
  }, [listings]);

  /* Filtered listings */
  const filtered = useMemo(() => {
    return listings.filter(l => {
      const matchSearch = !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.material?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'ALL' || l.status === filterStatus;
      const matchMaterial = filterMaterial === 'ALL' || l.material === filterMaterial;
      return matchSearch && matchStatus && matchMaterial;
    });
  }, [listings, search, filterStatus, filterMaterial]);

  return (
    <>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {editTarget && <EditModal listing={editTarget} onCancel={() => setEditTarget(null)} onSave={handleSaveEdit} />}
      {delTarget && <DeleteModal listing={delTarget} onCancel={() => setDelTarget(null)} onConfirm={handleConfirmDelete} />}

      <style>{`
        @keyframes slideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeUp  { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <Navbar />
      <main className="max-w-container mx-auto px-4 md:px-6 py-10 pb-32 md:pb-14 min-h-screen">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2">Seller Portal</span>
            <h1 className="text-h1 font-bold text-on-background tracking-tight">My Listings</h1>
            <p className="text-secondary mt-1 text-sm">{filtered.length} of {listings.length} listing{listings.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => router.push('/seller/add-material')}
            className="bg-primary text-white font-semibold px-6 py-3.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-sm w-fit">
            <span className="material-symbols-outlined">add_circle</span>Add New Material
          </button>
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-2xl border border-surface-container p-4 mb-6 flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or material…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-all bg-background"
            />
          </div>
          {/* Status filter */}
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary outline-none text-sm font-medium bg-background transition-all min-w-[140px]">
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="DRAFT">Draft</option>
          </select>
          {/* Material filter */}
          <select value={filterMaterial} onChange={e => setFilterMaterial(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary outline-none text-sm font-medium bg-background transition-all min-w-[160px]">
            <option value="ALL">All Materials</option>
            {materialTypes.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {/* Clear */}
          {(search || filterStatus !== 'ALL' || filterMaterial !== 'ALL') && (
            <button onClick={() => { setSearch(''); setFilterStatus('ALL'); setFilterMaterial('ALL'); }}
              className="px-4 py-2.5 text-secondary hover:text-error hover:bg-error-container/20 rounded-xl font-semibold text-sm transition-all flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">close</span>Clear
            </button>
          )}
        </div>

        {/* Listings */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-surface-container rounded-2xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-outline text-4xl">{listings.length === 0 ? 'inventory_2' : 'search_off'}</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">{listings.length === 0 ? 'No listings yet' : 'No results found'}</h3>
            <p className="text-secondary text-sm mb-6">{listings.length === 0 ? 'Start by adding your first material listing.' : 'Try adjusting your search or filters.'}</p>
            {listings.length === 0 && (
              <button onClick={() => router.push('/seller/add-material')}
                className="bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">add_circle</span>Add New Material
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(item => (
              <ListingCard key={item.id} item={item} onEdit={setEditTarget} onDelete={setDelTarget} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
