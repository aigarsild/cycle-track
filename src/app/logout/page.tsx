'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LogoutPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string>('Logging out...');

  useEffect(() => {
    async function performLogout() {
      try {
        setStatus('Signing out from Supabase...');
        await supabase.auth.signOut();
        
        setStatus('Clearing browser storage...');
        // Clear local and session storage
        localStorage.clear();
        sessionStorage.clear();
        
        setStatus('Clearing Supabase cookies...');
        // Call our server-side logout endpoint
        await fetch('/api/auth/logout');
        
        setStatus('Logout successful!');
        
        // Redirect after a brief delay
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } catch (error) {
        console.error('Error during logout:', error);
        setStatus('Logout failed, but redirecting anyway...');
        
        // Redirect to login even if there's an error
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    }
    
    performLogout();
  }, [router]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="mb-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Logging Out</h1>
      <p className="text-gray-600">{status}</p>
    </div>
  );
} 