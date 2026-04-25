'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const steps = [
  { icon: 'upload', label: 'IMAGE', done: true },
  { icon: 'auto_awesome', label: 'DETECTION', done: true },
  { icon: 'edit_note', label: 'DETAILS', active: true },
  { icon: 'fact_check', label: 'SUBMIT', done: false },
];

export default function SellPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-container mx-auto px-6 py-12 min-h-screen pb-32 md:pb-12">

        {/* ── Stepper ── */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-5 left-0 w-full h-[2px] bg-surface-container -z-0" />
            {steps.map(({ icon, label, done, active }) => (
              <div key={label} className="flex flex-col items-center gap-3 relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ring-4 ring-beige transition-all ${
                    done || active
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-surface-container-highest text-outline'
                  } ${active ? 'animate-pulse' : ''}`}
                >
                  <span className="material-symbols-outlined text-lg">{icon}</span>
                </div>
                <span
                  className={`text-xs font-bold tracking-widest uppercase ${
                    done || active ? 'text-primary' : 'text-outline'
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left: Material Preview */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-50">
              <h3 className="text-h3 font-semibold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">visibility</span>
                Material Insight
              </h3>
              <div className="relative rounded-lg overflow-hidden mb-6 aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=600&auto=format&fit=crop"
                  alt="Recycled cardboard bundles"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-primary/90 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                  98% Confidence
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border-l-4 border-primary">
                  <span className="text-sm font-medium text-secondary">Detected Material</span>
                  <span className="px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-xs font-bold uppercase tracking-widest">
                    Cardboard (OCC)
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border-l-4 border-primary-container">
                  <span className="text-sm font-medium text-secondary">Quality Grade</span>
                  <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full text-xs font-bold uppercase tracking-widest">
                    Grade A
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-50">
              <p className="text-xs text-outline font-bold tracking-widest uppercase mb-2">
                AI RECOMMENDATION
              </p>
              <p className="text-sm italic text-tertiary leading-relaxed">
                &ldquo;This material is in high demand for local paper mills. Current market rates are
                trending +5%.&rdquo;
              </p>
            </div>
          </div>

          {/* Right: Listing Form */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-50 h-full">
              <div className="mb-10">
                <h2 className="text-h2 font-bold mb-2 tracking-tight">Listing Details</h2>
                <p className="text-body-md text-secondary">
                  Refine the quantity and set your preferred pricing for the marketplace.
                </p>
              </div>

              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Quantity */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-outline uppercase tracking-widest block">
                      Estimated Quantity
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="500"
                        className="w-full px-4 py-4 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary bg-background outline-none transition-all font-semibold"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary font-medium">
                        KG
                      </span>
                    </div>
                  </div>

                  {/* Pricing Model */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-outline uppercase tracking-widest block">
                      Pricing Model
                    </label>
                    <select className="w-full px-4 py-4 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary bg-background outline-none transition-all font-semibold appearance-none cursor-pointer">
                      <option>Market Rate (Recommended)</option>
                      <option>Fixed Price</option>
                      <option>Bidding Only</option>
                      <option>Donation (Free)</option>
                    </select>
                  </div>

                  {/* Asking Price */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-outline uppercase tracking-widest block">
                      Asking Price (Total)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-medium">
                        $
                      </span>
                      <input
                        type="number"
                        placeholder="120.00"
                        className="w-full pl-10 pr-4 py-4 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary bg-background outline-none transition-all font-semibold"
                      />
                    </div>
                  </div>

                  {/* Pick-up Location */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-outline uppercase tracking-widest block">
                      Pick-up Facility
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                        location_on
                      </span>
                      <input
                        type="text"
                        defaultValue="Main Warehouse – Sector 7"
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary bg-background outline-none transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Logistics */}
                <div className="p-6 bg-secondary-container/30 rounded-xl space-y-4">
                  <h4 className="font-semibold text-on-secondary-container flex items-center gap-2">
                    <span className="material-symbols-outlined">local_shipping</span>
                    Logistics Preferences
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {['Self-Loading Available', 'Forklift on site', 'Hazardous Handling Needed'].map(
                      (opt, i) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-outline-variant cursor-pointer hover:border-primary transition-all"
                        >
                          <input
                            defaultChecked={i === 0}
                            type="checkbox"
                            className="rounded text-primary focus:ring-primary border-outline-variant"
                          />
                          <span className="text-sm font-medium">{opt}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-8 border-t border-surface-container">
                  <button
                    type="button"
                    className="px-8 py-4 text-primary font-semibold rounded-xl hover:bg-surface-container transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Previous Step
                  </button>
                  <button
                    type="submit"
                    className="px-10 py-4 bg-primary text-white font-semibold rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                  >
                    Review &amp; Submit
                    <span className="material-symbols-outlined">arrow_forward</span>
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
