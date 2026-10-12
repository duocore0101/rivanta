'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (user.role === 'ADMIN') {
          router.replace('/admin');
        } else {
          router.replace('/front-desk');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#172554] text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] flex items-center justify-center font-serif font-black text-2xl shadow-xl animate-pulse">
          R
        </div>
        <p className="text-sm font-medium tracking-wide text-blue-200">Loading Rivanta HMS...</p>
      </div>
    </div>
  );
}
