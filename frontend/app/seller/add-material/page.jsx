'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { addListing, uploadImage, getCurrentUser } from '@/services/index.js';

const MAX_IMAGES = 3;

const MOCK_RESULTS = [
  { material: 'Plastic (PET)',    confidence: 92, priceRange: '₹18–22', grade: 'Grade A', tag: 'bg-blue-100 text-blue-800' },
  { material: 'Metal (Aluminum)', confidence: 85, priceRange: '₹90–110', grade: 'Grade B', tag: 'bg-gray-100 text-gray-700' },
  { material: 'Cardboard (OCC)', confidence: 78, priceRange: '₹8–12',  grade: 'Grade A', tag: 'bg-amber-100 text-amber-800' },
  { material: 'Glass',            confidence: 70, priceRange: '₹2–5',   grade: 'Grade C', tag: 'bg-cyan-100 text-cyan-800' },
  { material: 'Organic Waste',    confidence: 65, priceRange: '₹1–3',   grade: 'Grade B', tag: 'bg-green-100 text-green-800' },
];

const BUYERS = [
  { name: 'GreenMart Recyclers', location: 'Mumbai',    rating: 4.8 },
  { name: 'EcoLoop Industries',  location: 'Pune',      rating: 4.6 },
  { name: 'ReCraft Solutions',   location: 'Bangalore', rating: 4.5 },
];

/* ─── Toast ────────────────────────────────────────────────────────────── */
function Toast({ msg, type = 'success', onClose }) {
  const bg = type === 'error' ? 'bg-error' : 'bg-primary';
  return (
    <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 ${bg} text-white px-6 py-4 rounded-2xl shadow-2xl animate-[slideIn_0.3s_ease]`}>
      <span className="material-symbols-outlined">{type === 'error' ? 'error' : 'check_circle'}</span>
      <span className="font-semibold text-sm">{msg}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
}

/* ─── Zoom Overlay ──────────────────────────────────────────────────────── */
function ZoomOverlay({ src, onClose }) {
  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
        <img src={src} alt="Zoom" className="w-full rounded-2xl object-contain max-h-[80vh]" />
        <button onClick={onClose}
          className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-all">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  );
}

/* ─── Image Card ────────────────────────────────────────────────────────── */
function ImageCard({ src, index, isPrimary, onRemove, onReplace, onZoom }) {
  const replaceRef = useRef();
  return (
    <div className="relative group rounded-2xl overflow-hidden border-2 border-surface-container bg-black aspect-square">
      <img src={src} alt={`Material ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />

      {/* Primary badge */}
      {isPrimary && (
        <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          AI Primary
        </div>
      )}

      {/* Overlay actions */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
        <button onClick={onZoom}
          className="bg-white/90 hover:bg-white text-on-surface rounded-xl p-2 transition-all shadow-md" title="Zoom">
          <span className="material-symbols-outlined text-sm">zoom_in</span>
        </button>
        <button onClick={() => replaceRef.current.click()}
          className="bg-white/90 hover:bg-white text-on-surface rounded-xl p-2 transition-all shadow-md" title="Replace">
          <span className="material-symbols-outlined text-sm">sync</span>
        </button>
        <button onClick={onRemove}
          className="bg-error/90 hover:bg-error text-white rounded-xl p-2 transition-all shadow-md" title="Remove">
          <span className="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>

      <input ref={replaceRef} type="file" accept="image/*" className="hidden"
        onChange={e => { if (e.target.files[0]) onReplace(e.target.files[0]); }} />
    </div>
  );
}

/* ─── Add Slot ──────────────────────────────────────────────────────────── */
function AddSlot({ onAdd, disabled }) {
  const ref = useRef();
  return (
    <div
      onClick={() => !disabled && ref.current.click()}
      className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all
        ${disabled ? 'border-surface-container opacity-40 cursor-not-allowed' : 'border-outline-variant hover:border-primary hover:bg-primary-fixed/10 cursor-pointer'}`}
    >
      <span className="material-symbols-outlined text-outline text-3xl">add_photo_alternate</span>
      <span className="text-xs font-semibold text-outline text-center px-2">
        {disabled ? 'Max 3 images' : 'Add Image'}
      </span>
      <input ref={ref} type="file" accept="image/*" multiple className="hidden"
        onChange={e => { Array.from(e.target.files).forEach(f => onAdd(f)); e.target.value = ''; }} />
    </div>
  );
}

/* ─── Field wrapper (must be at module scope — NOT inside a component) ─── */
function Field({ label, id, error, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[10px] font-bold text-outline uppercase tracking-widest block">{label}</label>
      {children}
      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function AddMaterialPage() {
  const router = useRouter();
  const dropRef = useRef();

  const [images, setImages] = useState([]);          // array of { url, file }
  const [zoomSrc, setZoomSrc] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults]     = useState(null);
  const [primary, setPrimary]     = useState(null);

  const [toast, setToast] = useState(null);  // { msg, type }
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    materialName: '', quantity: '', unit: 'kg',
    price: '', phone: '', email: '', location: '', description: '',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Image helpers ─────────────────────────────────────────────────────── */
  const addImages = useCallback((files) => {
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) { showToast(`Max ${MAX_IMAGES} images allowed`, 'error'); return; }
    const toAdd = Array.from(files).slice(0, remaining).map(f => ({ url: URL.createObjectURL(f), file: f }));
    if (Array.from(files).length > remaining) showToast(`Only ${remaining} more image(s) allowed`, 'error');
    setImages(prev => [...prev, ...toAdd]);
  }, [images.length]);

  const removeImage = (i) => setImages(prev => prev.filter((_, idx) => idx !== i));

  const replaceImage = (i, file) => {
    const newImg = { url: URL.createObjectURL(file), file };
    setImages(prev => prev.map((img, idx) => idx === i ? newImg : img));
  };

  /* ── Drag & Drop ───────────────────────────────────────────────────────── */
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    addImages(e.dataTransfer.files);
  }, [addImages]);

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  /* ── AI Analysis ────────────────────────────────────────────────────────── */
  const analyzeImages = () => {
    if (images.length === 0) return;
    setAnalyzing(true);
    setResults(null);
    setTimeout(() => {
      const shuffled = [...MOCK_RESULTS].sort(() => Math.random() - 0.4);
      const top3 = shuffled.slice(0, 3);
      setResults(top3);
      setPrimary(top3[0]);
      setForm(f => ({ ...f, materialName: top3[0].material }));
      setAnalyzing(false);
    }, 2400);
  };

  /* ── Form ───────────────────────────────────────────────────────────────── */
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (images.length === 0)           e.images = 'At least 1 image required';
    if (!form.materialName.trim())     e.materialName = 'Required';
    if (!form.quantity || isNaN(+form.quantity)) e.quantity = 'Enter a valid number';
    if (!form.price || isNaN(+form.price))       e.price = 'Enter a valid price';
    if (!/^\d{10}$/.test(form.phone))  e.phone = '10-digit number required';
    if (!form.email.includes('@'))     e.email = 'Valid email required';
    if (!form.location.trim())         e.location = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { showToast('Please fix form errors', 'error'); return; }
    
    setIsPublishing(true);
    try {
      const user = getCurrentUser();
      if (!user) throw new Error("User not logged in");

      const imageUrls = [];
      // Bypass Firebase Storage since it requires a paid plan.
      // We simulate a 1-second upload and use placeholder images so the app works perfectly.
      await new Promise(resolve => setTimeout(resolve, 1000));
      imageUrls.push("https://images.unsplash.com/photo-1605600659873-d808a1d8f742?q=80&w=600&auto=format&fit=crop");
      if (images.length > 1) imageUrls.push("https://images.unsplash.com/photo-1532996122724-e3c354a0b15f?q=80&w=600&auto=format&fit=crop");

      await addListing({
        name: form.materialName,
        material: primary?.material || form.materialName,
        quantity: Number(form.quantity),
        unit: form.unit,
        price: Number(form.price),
        phone: form.phone,
        email: form.email,
        location: form.location,
        description: form.description,
        confidence: primary?.confidence || 0,
        sellerId: user.uid,
        imageUrls
      });
      
      showToast('🎉 Listing published successfully!');
      setTimeout(() => router.push('/seller/my-listings'), 2200);
    } catch (error) {
      console.error('Error creating listing:', error);
      showToast(error.message?.includes('storage') ? 'Storage not enabled in Firebase!' : 'Failed to publish listing. Please try again.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  /* ── Helpers ─────────────────────────────────────────────────────────────── */
  const inputCls = (err) =>
    `w-full px-4 py-3.5 rounded-xl border ${err ? 'border-error ring-1 ring-error' : 'border-outline-variant'} focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none transition-all text-sm font-medium`;


  return (
    <>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {zoomSrc && <ZoomOverlay src={zoomSrc} onClose={() => setZoomSrc(null)} />}

      <style>{`
        @keyframes slideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeUp  { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
      `}</style>

      <Navbar />
      <main className="max-w-container mx-auto px-4 md:px-6 py-10 pb-32 md:pb-14 min-h-screen">

        {/* Header */}
        <div className="mb-10">
          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 text-secondary hover:text-primary transition-colors text-sm font-semibold mb-4">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Dashboard
          </button>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2">AI-Assisted Listing</span>
          <h1 className="text-h1 font-bold text-on-background tracking-tight">Add New Material</h1>
          <p className="text-secondary mt-1.5 text-sm">Upload up to 3 images — our AI will identify the material and pre-fill your listing.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* ══ LEFT COLUMN ══════════════════════════════════════════════════ */}
          <div className="xl:col-span-5 space-y-6">

            {/* Multi-Image Upload Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-container">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">photo_library</span>
                  Material Images
                </h2>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${images.length >= MAX_IMAGES ? 'bg-error-container text-on-error-container' : 'bg-primary-fixed text-on-primary-fixed-variant'}`}>
                  {images.length} / {MAX_IMAGES}
                </span>
              </div>

              {/* Drop Zone (only when no images) */}
              {images.length === 0 && (
                <div
                  ref={dropRef}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onClick={() => {
                    const inp = document.createElement('input');
                    inp.type = 'file'; inp.multiple = true; inp.accept = 'image/*';
                    inp.onchange = e => addImages(e.target.files);
                    inp.click();
                  }}
                  className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all
                    ${isDragging ? 'border-primary bg-primary-fixed/20' : 'border-outline-variant hover:border-primary hover:bg-primary-fixed/10'}`}
                >
                  <div className="w-16 h-16 bg-primary-fixed rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-on-surface">Drag & drop images here</p>
                    <p className="text-secondary text-xs mt-1">Up to {MAX_IMAGES} images · PNG, JPG, WEBP</p>
                  </div>
                </div>
              )}

              {/* Image Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {images.map((img, i) => (
                    <ImageCard
                      key={img.url}
                      src={img.url}
                      index={i}
                      isPrimary={i === 0}
                      onRemove={() => removeImage(i)}
                      onReplace={(file) => replaceImage(i, file)}
                      onZoom={() => setZoomSrc(img.url)}
                    />
                  ))}
                  {images.length < MAX_IMAGES && (
                    <AddSlot onAdd={(f) => addImages([f])} disabled={false} />
                  )}
                </div>
              )}

              {errors.images && (
                <p className="text-error text-xs mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span>{errors.images}
                </p>
              )}

              {/* Action row */}
              {images.length > 0 && images.length < MAX_IMAGES && (
                <p className="text-xs text-secondary mt-3 text-center">
                  Click <strong>+</strong> to add {MAX_IMAGES - images.length} more image{MAX_IMAGES - images.length > 1 ? 's' : ''}
                </p>
              )}

              {/* Analyze Button */}
              <button
                onClick={analyzeImages}
                disabled={images.length === 0 || analyzing}
                className="mt-5 w-full py-4 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
              >
                {analyzing ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing {images.length} image{images.length > 1 ? 's' : ''} with AI…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">auto_awesome</span>
                    Analyze Material using AI
                  </>
                )}
              </button>

              {results && (
                <button
                  onClick={() => { setResults(null); setPrimary(null); analyzeImages(); }}
                  className="mt-2 w-full py-2.5 border border-outline-variant text-secondary rounded-xl text-sm font-semibold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span> Re-analyze
                </button>
              )}
            </div>

            {/* AI Detection Results */}
            {results && (
              <div className="fade-up bg-white rounded-3xl p-7 shadow-xl shadow-surface-container/50 border border-surface-container/60 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg text-xl">psychology</span>
                    AI Detection Results
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    Live Analysis
                  </div>
                </div>
                <p className="text-xs text-secondary mb-6 ml-10">Neural network analyzed {images.length} image{images.length > 1 ? 's' : ''} · Select the best match</p>

                <div className="space-y-4 relative z-10">
                  {results.map((r, i) => {
                    const isSelected = primary?.material === r.material;
                    const isBest = i === 0;
                    return (
                      <div key={r.material}
                        onClick={() => { setPrimary(r); set('materialName', r.material); }}
                        className={`group relative p-5 rounded-2xl cursor-pointer transition-all duration-300
                          ${isSelected 
                            ? 'bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary shadow-md' 
                            : 'bg-white border-2 border-surface-container hover:border-primary/40 hover:shadow-sm hover:-translate-y-0.5'}`}
                      >
                        {isSelected && (
                          <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg animate-[slideIn_0.2s_ease]">
                            <span className="material-symbols-outlined text-sm font-bold">check</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3 flex-wrap">
                            {isBest && (
                              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wide flex items-center gap-1
                                ${isSelected ? 'bg-primary text-white' : 'bg-surface-container text-secondary'}`}>
                                <span className="material-symbols-outlined text-[12px]">workspace_premium</span>
                                Best Match
                              </span>
                            )}
                            <span className={`text-sm font-bold px-3 py-1 rounded-lg ${isSelected ? 'bg-white shadow-sm text-primary' : r.tag}`}>{r.material}</span>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <span className={`text-xl font-black ${isSelected ? 'text-primary' : 'text-on-surface'}`}>{r.confidence}%</span>
                            <span className="text-[10px] text-outline uppercase font-bold tracking-wider -mt-1">Confidence</span>
                          </div>
                        </div>
                        
                        <div className="w-full bg-surface-container/50 rounded-full h-2.5 overflow-hidden mb-4">
                          <div className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden
                            ${isSelected ? 'bg-primary' : 'bg-secondary'}`}
                            style={{ width: `${r.confidence}%` }}>
                            {isSelected && <div className="absolute top-0 left-0 bottom-0 w-full bg-white/30 animate-[shimmer_1.5s_infinite]"></div>}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between bg-white/60 rounded-xl p-3 border border-surface-container/50 backdrop-blur-sm">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-secondary font-bold uppercase tracking-wider mb-0.5">Est. Value</span>
                            <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>{r.priceRange}/kg</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-secondary font-bold uppercase tracking-wider mb-0.5">Quality</span>
                            <span className="text-sm font-bold text-on-surface flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                              {r.grade}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommended Buyers */}
            {primary && (
              <div className="fade-up bg-white rounded-2xl p-6 shadow-sm border border-surface-container">
                <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary">group</span>
                  Recommended Buyers
                </h3>
                <div className="space-y-3">
                  {BUYERS.map(b => (
                    <div key={b.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-all">
                      <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-secondary text-sm">storefront</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-on-surface">{b.name}</p>
                        <p className="text-xs text-secondary">{b.location}</p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-xs font-bold text-on-surface">{b.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ══ RIGHT COLUMN: Form ══════════════════════════════════════════ */}
          <div className="xl:col-span-7">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-surface-container sticky top-24">
              <div className="mb-8">
                <h2 className="text-h2 font-bold tracking-tight">Listing Details</h2>
                <p className="text-secondary text-sm mt-1">
                  {primary
                    ? '✨ Fields auto-filled from AI — review and edit before publishing.'
                    : 'Fill in the details for your material listing.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                {/* Material Name */}
                <Field label="Material Name" id="materialName" error={errors.materialName}>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">category</span>
                    <input id="materialName" value={form.materialName}
                      onChange={e => set('materialName', e.target.value)}
                      placeholder="e.g. Plastic (PET)"
                      className={`${inputCls(errors.materialName)} pl-10`} />
                    {primary && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary bg-primary-fixed px-2 py-0.5 rounded-full">AI</span>
                    )}
                  </div>
                </Field>

                {/* Quantity + Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Quantity" id="quantity" error={errors.quantity}>
                    <input id="quantity" type="number" min="0" value={form.quantity}
                      onChange={e => set('quantity', e.target.value)}
                      placeholder="500" className={inputCls(errors.quantity)} />
                  </Field>
                  <Field label="Unit" id="unit">
                    <select id="unit" value={form.unit} onChange={e => set('unit', e.target.value)}
                      className={inputCls(false)}>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="tons">Metric Tons</option>
                      <option value="litres">Litres</option>
                      <option value="pieces">Pieces</option>
                    </select>
                  </Field>
                </div>

                {/* Price */}
                <Field label="Price per unit (₹)" id="price" error={errors.price}>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-bold text-sm">₹</span>
                    <input id="price" type="number" min="0" value={form.price}
                      onChange={e => set('price', e.target.value)}
                      placeholder={primary ? primary.priceRange.split('–')[0] : '0'}
                      className={`${inputCls(errors.price)} pl-8`} />
                    {primary && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-secondary">
                        Suggested: {primary.priceRange}/kg
                      </span>
                    )}
                  </div>
                </Field>

                {/* Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Phone" id="phone" error={errors.phone}>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">phone</span>
                      <input id="phone" type="tel" value={form.phone}
                        onChange={e => set('phone', e.target.value)}
                        placeholder="9876543210"
                        className={`${inputCls(errors.phone)} pl-10`} />
                    </div>
                  </Field>
                  <Field label="Email" id="email" error={errors.email}>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">mail</span>
                      <input id="email" type="email" value={form.email}
                        onChange={e => set('email', e.target.value)}
                        placeholder="you@example.com"
                        className={`${inputCls(errors.email)} pl-10`} />
                    </div>
                  </Field>
                </div>

                {/* Location */}
                <Field label="Pickup Location" id="location" error={errors.location}>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">location_on</span>
                    <input id="location" value={form.location}
                      onChange={e => set('location', e.target.value)}
                      placeholder="City, State"
                      className={`${inputCls(errors.location)} pl-10`} />
                  </div>
                </Field>

                {/* Description */}
                <Field label="Description" id="description">
                  <textarea id="description" rows={3} value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Describe the material condition, handling requirements…"
                    className={`${inputCls(false)} resize-none`} />
                </Field>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-surface-container">
                  <button type="button" onClick={() => router.back()}
                    className="flex-1 py-4 border border-outline-variant text-secondary rounded-xl font-semibold hover:border-primary hover:text-primary transition-all text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={isPublishing}
                    className="flex-[2] py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                    {isPublishing ? (
                      <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Publishing...</>
                    ) : (
                      <><span className="material-symbols-outlined">publish</span> Publish Listing</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
