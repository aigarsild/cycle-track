'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearCachePage() {
  const router = useRouter();
  const [status, setStatus] = useState<string>('Clearing all browser cache...');

  useEffect(() => {
    async function clearAllCaches() {
      try {
        // Clear localStorage
        setStatus('Clearing localStorage...');
        localStorage.clear();
        
        // Clear sessionStorage
        setStatus('Clearing sessionStorage...');
        sessionStorage.clear();
        
        // Clear cookies related to Supabase
        setStatus('Clearing auth cookies...');
        document.cookie.split(';').forEach(cookie => {
          const parts = cookie.trim().split('=');
          if (parts.length >= 1) {
            const name = parts[0];
            if (name && (name.includes('supabase') || name.includes('sb-') || name.includes('auth'))) {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
            }
          }
        });
        
        // Call our server logout endpoint
        setStatus('Calling server logout endpoint...');
        await fetch('/api/auth/logout');
        
        setStatus('Cache cleared successfully!');
        
        // Redirect after a brief delay
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } catch (error) {
        console.error('Error clearing cache:', error);
        setStatus('Error clearing cache. Redirecting anyway...');
        
        // Redirect to login even if there's an error
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    }
    
    clearAllCaches();
  }, [router]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Clearing Browser Cache</h1>
        
        <div className="mb-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        
        <p className="text-center text-gray-700 mb-4">{status}</p>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This operation clears all local storage, session storage, and auth cookies.</p>
          <p className="mt-2">You will be redirected to the login page automatically.</p>
        </div>
      </div>
    </div>
  );
} 