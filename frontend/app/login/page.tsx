'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect legacy /login route to the new /auth role-selection page
export default function LoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/auth');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-on-surface-variant font-medium">Redirecting…</p>
      </div>
    </div>
  );
}
