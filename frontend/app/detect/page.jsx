'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function DetectPage() {
  const [analyzed, setAnalyzed] = useState(true);

  return (
    <>
      <Navbar />
      <main className="max-w-container mx-auto px-6 pt-12 pb-32 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Left Column: Detection Interface ── */}
          <div className="lg:col-span-7 space-y-8">
            <section>
              <h1 className="text-h1 font-bold text-on-surface mb-4 tracking-tight">
                Waste Classification
              </h1>
              <p className="text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                Upload a photo of your item and our EcoCycle AI will identify the material and provide
                precise disposal instructions.
              </p>
            </section>

            {/* Upload Area */}
            <div className="bg-white border-2 border-dashed border-outline-variant rounded-xl p-12 flex flex-col items-center justify-center text-center hover:border-primary transition-all duration-300 cursor-pointer group">
              <div className="w-20 h-20 bg-primary-fixed/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-4xl">center_focus_weak</span>
              </div>
              <h3 className="text-h3 font-semibold mb-2">Scan or Upload</h3>
              <p className="text-on-surface-variant mb-8 text-body-md">
                Drag and drop your image here, or use your camera
              </p>
              <div className="flex gap-4 flex-wrap justify-center">
                <button className="bg-primary text-white font-semibold px-8 py-4 rounded-xl flex items-center gap-2 hover:shadow-lg transition-all active:scale-95">
                  <span className="material-symbols-outlined">photo_camera</span>
                  Use Camera
                </button>
                <button className="border border-outline text-on-surface font-semibold px-8 py-4 rounded-xl hover:bg-surface-container transition-all active:scale-95">
                  Browse Files
                </button>
              </div>
            </div>

            {/* Preview Area */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-surface-container flex justify-between items-center bg-surface-container-low">
                <span className="text-xs font-bold text-secondary uppercase tracking-widest">
                  Image Preview
                </span>
                <button className="text-error hover:bg-error-container/20 p-2 rounded-full transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="relative aspect-video w-full bg-surface-dim">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_4hHfd9rinCRb_zC6nRsDyfYRAiOlFIVJRvEsMPPLdlGc8lrs8jJhKh90cvQCzU6FM3sLhYrOAR6zxfjhIasYduv5WjgUsosFlOZbHuYuGIiJQHhsvjnhmoMIJSUMVjD4It2t1d-pZceenObYvO2MAFJusdCg4IFsnPa__S0MchgMAKh1_Fd8rVM_KuUVzCx5pFe9LGTXw8CvHeRRy3v51F8zh6po72E1TEhxuHxAqXILIpuu_7mGY5QsUgCrBo7_G9TWcW-eRYs"
                  alt="Disposable coffee cup on neutral background"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 bg-surface-container-low flex justify-center">
                <button
                  onClick={() => setAnalyzed(true)}
                  className="w-full max-w-md bg-primary text-white font-semibold px-8 py-5 rounded-xl shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Analyze Waste
                </button>
              </div>
            </div>
          </div>

          {/* ── Right Column: Results & Insights ── */}
          <div className="lg:col-span-5 space-y-8">
            {/* Result Card */}
            <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] border-l-4 border-primary-container p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <span className="text-xs font-bold text-primary bg-primary-fixed/20 px-3 py-1 rounded-full uppercase tracking-widest">
                    Detected Material
                  </span>
                  <h2 className="text-h2 font-bold mt-3 tracking-tight">Cardboard &amp; Plastic</h2>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-primary">94%</span>
                  <p className="text-[10px] uppercase font-bold text-secondary tracking-widest">
                    Confidence
                  </p>
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="w-full h-2 bg-surface-container rounded-full mb-8 overflow-hidden">
                <div className="h-full bg-primary-container rounded-full transition-all duration-1000" style={{ width: '94%' }} />
              </div>

              {/* Instructions */}
              <div className="space-y-6">
                <div className="flex gap-4 items-start p-4 bg-primary-fixed/10 rounded-xl border border-primary-fixed/20">
                  <div className="w-10 h-10 rounded-lg bg-primary-container text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">recycling</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-1">Instruction: Separate Components</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Remove the plastic lid (Polypropylene #5) from the paper sleeve. Rinse the cup if
                      there&apos;s liquid residue.
                    </p>
                  </div>
                </div>

                {/* Status Strips */}
                <div className="grid gap-3">
                  {[
                    { color: 'bg-primary', border: 'border-primary/20 bg-primary-fixed/10', label: 'Sleeve: Blue Bin (Paper)' },
                    { color: 'bg-yellow-500', border: 'border-yellow-400/20 bg-yellow-50', label: 'Lid: Specialty Recycler (Plastic #5)' },
                    { color: 'bg-error', border: 'border-error/20 bg-error-container/10', label: 'Liner: Landfill (Contaminated)' },
                  ].map(({ color, border, label }) => (
                    <div key={label} className={`flex items-center gap-3 p-3 rounded-lg border ${border}`}>
                      <span className={`w-3 h-3 rounded-full ${color} flex-shrink-0`} />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full mt-8 border border-outline text-secondary font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-surface-container transition-all">
                <span className="material-symbols-outlined">location_on</span>
                Find Nearest Disposal Site
              </button>
            </div>

            {/* Bento Insights */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary-container/40 p-6 rounded-xl flex flex-col justify-between aspect-square">
                <span className="material-symbols-outlined text-primary">eco</span>
                <div>
                  <p className="text-2xl font-bold">12.4 kg</p>
                  <p className="text-xs uppercase font-bold text-on-surface-variant/70 tracking-widest mt-1">
                    CO₂ Offset This Month
                  </p>
                </div>
              </div>
              <div className="bg-surface-container-highest p-6 rounded-xl flex flex-col justify-between aspect-square">
                <span className="material-symbols-outlined text-tertiary">military_tech</span>
                <div>
                  <p className="text-2xl font-bold">Guardian</p>
                  <p className="text-xs uppercase font-bold text-on-surface-variant/70 tracking-widest mt-1">
                    Current Steward Level
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
