'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#4AA8FF] to-[#FF7A00] rounded-lg flex items-center justify-center mb-4 mx-auto">
            <span className="text-white font-bold text-xl">CW</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4AA8FF] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading CityWitty Admin Panel...</p>
        </div>
      </div>
    );
  }

  return null;
}