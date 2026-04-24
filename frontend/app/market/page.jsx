'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactSellerModal from '@/components/ContactSellerModal';

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

const items = [
  {
    id: 1,
    tag: 'PET Plastic',
    name: 'Baled Clear PET',
    price: '$450',
    location: 'Portland, OR (12 miles)',
    qty: '12.5 Tonnes',
    detail: '< 1% Contamination',
    detailLabel: 'Contamination Level:',
    detailColor: 'text-primary',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQZsMX46qFPCJxvfKIl2fb-u414b0TSer9jEH1HdLlM5Ls7UyDwTxQslScNzQ1caJ5s0trL5m3hlbKCSl1DyhZTet5vNktgml6C3dKTCkMEWaXt_P-0zdCaGq0mixy8-KMo6rLNZovXiCgsijXpLISDBvs20s3IwMbEXdLjexsR8tmtRmRoi9JJY2pcGklnGIwmK_oJG5tsrpdJfftIiZ-7dRCLVgFYlho0kE-Qg4ElmLpE3wj3NPNADP3J5tNgy0zphRgaFI8FmA',
  },
  {
    id: 2,
    tag: 'Aluminum',
    name: 'Shredded UBC',
    price: '$1,200',
    location: 'Seattle, WA (140 miles)',
    qty: '5.0 Tonnes',
    detail: 'Magnetically Sorted',
    detailLabel: 'Processing:',
    detailColor: 'text-on-surface',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwfajEEy2uvx70sPEMAcKlUPdizd9EC2uaTuaVerdzBuantdB44RviotcGtdAn7Wi69BsSsEKLRItNgRAy5xsE0ZRZNPtpLVpYxFPdEveZX7bOBMVDnXfcH5XdpX0ownn8lbWAczhz_8jynlzQmVhMG17yZKwchnNkZYa4WyAEcxmfFIue3vx7nYV9qBZ3S_Hr0ScukKVrt0-S2K18FZO7PkPLNPa-G22qdPX2ETjiTBcMOJV3UwF8Vq5MGUonnxZAXE_00cAIUC0',
  },
  {
    id: 3,
    tag: 'Paper & Pulp',
    name: 'OCC Baled Cardboard',
    price: '$120',
    location: 'Beaverton, OR (8 miles)',
    qty: '45.0 Tonnes',
    detail: 'Grade A Clean',
    detailLabel: 'Quality:',
    detailColor: 'text-on-surface',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDviKntuTeITfy4h33YlHy6eZtL8dQzTvtPyabFJZYuAu__uQo0ytw_88J2e-QaO9Lc7U_wlGeNeUClsguzfqunure7NRQ8ZkjrYBSpQcgJFWtwjrLsBMP7wMN1GStxSbWdpA7yRCHHnAcYFBY_ctzHN5pbvTAIpkzfpUUTTyhtdVoTTFk5ZznOdIeJgM7bd50TQT8OpmlvG_3xj7scQqV7paRvfTBVBykFawDv4S51CtHletIoqHO0jVy7H9JD3AtoUHagFFeZkCw',
  },
  {
    id: 4,
    tag: 'Glass',
    name: 'Green Cullet',
    price: '$85',
    location: 'Eugene, OR (110 miles)',
    qty: '8.2 Tonnes',
    detail: 'Color Sorted',
    detailLabel: 'Sorting:',
    detailColor: 'text-on-surface',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAG2ZQ-kjNbNAmhFo3doI8pxGIXeW4y45af11xyK0ZaRGUeG-EeM8Ex43aHNvDZwR4fRPKiYRfQyxGbhUqSBXOAg_0cQMk2Y1yc_L7iAFrkoO9puwy6db9VzrkeB5tfSjkMrd2Usd4WpxijGb95gDN7B6A60ob-dmgbQ1eDg_t2rRPtokQPa_hmNQek-TfC523sk70hJBtr4r0ANyfE3ueSSUB-snCLqUt1l66B4k19EuYJqRcBhP67Eu0U4LKzxodCC2hjHkJ0x-M',
  },
  {
    id: 5,
    tag: 'HDPE Plastic',
    name: 'HDPE Regrind White',
    price: '$950',
    location: 'Vancouver, WA (15 miles)',
    qty: '3.4 Tonnes',
    detail: 'Regrind Flake',
    detailLabel: 'Form:',
    detailColor: 'text-on-surface',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwNAhlInn8nozOI2if_zh6eJSYj0LyN0cQyaTxovDkpyhG_g5Ytgu4RPOKIuvtnum60vIINN3b76f2cZDeOhV_qZdd-knkXcYQJrYAxyDSjmddcNFI_TvWHyUjBftan2yIxuWMGE4WgBAKkSkRNMExssFpf0jVolBNwt6LN-Q0_DhFQZYeD6lhOISEsR_Ohgr_F7rMYU7r4QPpsxcu0PkeFznGqXiqTFVyAZ0GSIq_7J3Qk6NlL_LYkrYUTn3EC3jNk4TsKsCeDlw',
  },
];

const materialTypes = ['All Materials', 'PET Plastic', 'Aluminum', 'Paper & Pulp', 'Glass', 'HDPE Plastic'];
const locations = ['Within 50 miles', 'Within 100 miles', 'Regional', 'National'];

export default function MarketPage() {
  const [search, setSearch]         = useState('');
  const [material, setMaterial]     = useState('All Materials');
  const [contactItem, setContactItem] = useState(null);   // item currently in modal
  const [toast, setToast]           = useState(null);
  const [loading, setLoading]       = useState(false);

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
          onSent={() => showToast('✅ Request sent to seller successfully!')}
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
              <div className="relative h-56 w-full overflow-hidden">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                    {item.tag}
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-h3 font-semibold text-on-surface">{item.name}</h3>
                  <div className="text-right">
                    <p className="text-primary font-bold text-xl">{item.price}</p>
                    <p className="text-[10px] text-outline font-bold uppercase tracking-tighter">Per Tonne</p>
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
