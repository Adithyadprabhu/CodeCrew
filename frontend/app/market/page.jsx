'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactSellerModal from '@/components/ContactSellerModal';
import { listenToActiveListings, placeOrder } from '@/services/index.js';
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

/* ── Inline Toast ─────────────────────────────────────────────── */
function Toast({ msg, onClose }) {
  return (
    <div className="fixed top-6 right-6 z-[350] flex items-center gap-3 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl font-semibold text-sm animate-[slideIn_0.3s_ease]">
      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      {msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
}

const materialTypes = ['All Materials', 'PET Plastic', 'Aluminum', 'Paper & Pulp', 'Glass', 'HDPE Plastic'];
const locations = ['Within 50 miles', 'Within 100 miles', 'Regional', 'National'];
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=600&auto=format&fit=crop';

export default function MarketPage() {
  const [search, setSearch]         = useState('');
  const [material, setMaterial]     = useState('All Materials');
  const [contactItem, setContactItem] = useState(null);   // item currently in modal
  const [toast, setToast]           = useState(null);
  const [loading, setLoading]       = useState(false);
  const [items, setItems]           = useState([]);

  useEffect(() => {
    let unsub = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        try {
          unsub = listenToActiveListings((data) => {
            const formatted = data.map(d => ({
              id: d.id,
              name: d.name || `${d.quantity} ${d.unit || 'kg'} of ${d.material}`,
              tag: d.material,
              price: `₹${d.price}`,
              location: d.location || 'Local',
              qty: `${d.quantity} ${d.unit || 'kg'}`,
              detail: 'Active Listing',
              detailLabel: 'Status:',
              detailColor: 'text-primary',
              img: d.imageUrls?.[0] || FALLBACK_IMAGE,
            }));
            setItems(formatted);
          });
        } catch (error) {
          console.error("Failed to listen to active listings:", error);
        }
      } else {
        setItems([]);
        if (unsub) unsub();
      }
    });

    return () => {
      unsubAuth();
      if (unsub) unsub();
    };
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleContactSeller = (item) => {
    try {
      setContactItem(item);
    } catch (error) {
      console.error('Error opening contact modal:', error);
      showToast('Failed to open contact form. Try again.', 'error');
    }
  };

  const filtered = items.filter((item) => {
    const matchSearch = search === '' || item.name.toLowerCase().includes(search.toLowerCase());
    const matchMaterial = material === 'All Materials' || item.tag === material;
    return matchSearch && matchMaterial;
  });

  return (
    <>
      <style>{`@keyframes slideIn { from { transform:translateX(120%); opacity:0; } to { transform:translateX(0); opacity:1; } }`}</style>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {contactItem && (
        <ContactSellerModal
          item={contactItem}
          onClose={() => setContactItem(null)}
          onSent={async () => {
            try {
              await placeOrder(contactItem.id);
              showToast('✅ Order placed successfully!');
            } catch (error) {
              console.error(error);
              showToast('❌ Failed to place order: ' + error.message);
            }
          }}
        />
      )}

      <Navbar />
      <main className="max-w-container mx-auto px-6 py-12 pb-32 md:pb-12">

        {/* Header */}
        <section className="mb-12">
          <h1 className="text-h1 font-bold text-on-background mb-4 tracking-tight">
            Circular Marketplace
          </h1>
          <p className="text-body-lg text-secondary max-w-2xl leading-relaxed">
            Connect with local partners to exchange, sell, or buy processed recycled materials.
            Together we close the loop.
          </p>
        </section>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-secondary uppercase tracking-widest mb-2 block">
              Search Resources
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                search
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by material name or keyword..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex gap-4 w-full lg:w-auto">
            <div className="w-full lg:w-48">
              <label className="text-xs font-bold text-secondary uppercase tracking-widest mb-2 block">
                Material Type
              </label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-4 py-4 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
              >
                {materialTypes.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="w-full lg:w-48">
              <label className="text-xs font-bold text-secondary uppercase tracking-widest mb-2 block">
                Location
              </label>
              <select className="w-full px-4 py-4 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer">
                {locations.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col hover:shadow-[0_12px_24px_rgba(0,0,0,0.05)] transition-all duration-300 group border border-transparent hover:border-outline-variant"
            >
              <div className="p-6 flex flex-col flex-1 border-t-4 border-primary">
                <div className="mb-4">
                  <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                    {item.tag}
                  </span>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-h3 font-semibold text-on-surface">{item.name}</h3>
                  <div className="text-right">
                    <p className="text-primary font-bold text-xl">{item.price}</p>
                    <p className="text-[10px] text-outline font-bold uppercase tracking-tighter">Per Unit</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-6 text-secondary">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  <span className="text-sm">{item.location}</span>
                </div>
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-outline">Quantity Available:</span>
                    <span className="font-semibold text-on-surface">{item.qty}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-outline">{item.detailLabel}</span>
                    <span className={`font-semibold ${item.detailColor}`}>{item.detail}</span>
                  </div>
                </div>
                <div className="mt-auto">
                  <button
                    onClick={() => setContactItem(item)}
                    className="w-full py-4 bg-primary text-white rounded-xl font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Contact Seller
                    <span className="material-symbols-outlined text-lg">chat</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

        </div>
      </main>
      <Footer />
    </>
  );
}
