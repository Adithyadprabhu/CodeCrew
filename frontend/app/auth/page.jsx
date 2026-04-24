'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AuthPage() {
  const router = useRouter();

  const handleRole = (role) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ecocycle_role', role);
    }
    router.push(`/auth/${role}`);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100dvh-80px)] flex items-center justify-center px-4 pb-24 md:pb-0">
        <div className="w-full max-w-lg">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-fixed mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">eco</span>
            </div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
              Welcome to EcoCycle AI
            </p>
            <h1 className="text-h1 font-bold text-on-background tracking-tight mb-4">
              Choose your path
            </h1>
            <p className="text-body-lg text-on-surface-variant max-w-sm mx-auto leading-relaxed">
              Select how you participate in the circular economy.
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Buyer Card */}
            <button
              onClick={() => handleRole('buyer')}
              className="group relative bg-white border-2 border-transparent hover:border-primary p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(65,103,67,0.12)] transition-all duration-300 text-left flex flex-col gap-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary-container flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-primary text-2xl">shopping_basket</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-on-surface mb-2">Buyer</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Source high-quality recycled materials from verified suppliers in the circular marketplace.
                </p>
              </div>
              <div className="flex items-center gap-2 text-primary font-semibold text-sm mt-auto">
                Sign In as Buyer
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-primary/0 group-hover:bg-primary/[0.02] transition-colors" />
            </button>

            {/* Seller Card */}
            <button
              onClick={() => handleRole('seller')}
              className="group relative bg-primary border-2 border-primary p-8 rounded-2xl shadow-[0_4px_20px_rgba(65,103,67,0.2)] hover:shadow-[0_12px_32px_rgba(65,103,67,0.3)] transition-all duration-300 text-left flex flex-col gap-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-white text-2xl">storefront</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Seller</h2>
                <p className="text-sm text-white/80 leading-relaxed">
                  List your recovered materials, set pricing, and connect with buyers ready to close the loop.
                </p>
              </div>
              <div className="flex items-center gap-2 text-white font-semibold text-sm mt-auto">
                Sign In as Seller
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </button>
          </div>

          {/* Footer note */}
          <p className="text-center text-sm text-on-surface-variant mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-primary font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
