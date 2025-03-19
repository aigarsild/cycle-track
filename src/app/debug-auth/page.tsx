'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function DebugAuth() {
  const { user, session, isLoading } = useAuth();
  const [serverSession, setServerSession] = useState<any>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [directSession, setDirectSession] = useState<any>(null);
  const [directError, setDirectError] = useState<string | null>(null);
  const [fixAttempted, setFixAttempted] = useState(false);
  const [cookieString, setCookieString] = useState<string>('');

  useEffect(() => {
    // Set the cookie string
    setCookieString(document.cookie || 'No cookies found');

    // Check auth state directly with Supabase client
    const checkSupabase = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setDirectError(error.message);
        } else {
          setDirectSession(data.session);
        }
      } catch (err) {
        setDirectError('Error checking direct session: ' + String(err));
      }
    };

    // Check auth state through our API
    const checkServer = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        setServerSession(data);
      } catch (err) {
        setServerError('Error checking server session: ' + String(err));
      }
    };

    checkSupabase();
    checkServer();
  }, []);

  const clearAllAuth = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear server session
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Clear local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(';').forEach(c => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });
      
      setFixAttempted(true);
      
      // Reload after a brief delay
      setTimeout(() => {
        window.location.href = '/debug-auth';
      }, 1000);
    } catch (err) {
      console.error('Error clearing auth:', err);
    }
  };

  const fixAuth = async () => {
    try {
      // Create and store new session manually
      await fetch('/api/auth/fix-session', { method: 'POST' });
      
      setFixAttempted(true);
      
      // Reload after a brief delay
      setTimeout(() => {
        window.location.href = '/debug-auth';
      }, 1000);
    } catch (err) {
      console.error('Error fixing auth:', err);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Information</h1>
      
      {fixAttempted && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p className="font-bold">Operation completed!</p>
          <p>The page will reload shortly. If it doesn&apos;t, <button onClick={() => window.location.reload()} className="underline">click here</button>.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Auth Context State</h2>
          {isLoading ? (
            <p className="text-gray-500">Loading auth state...</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">User:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
                  {user ? JSON.stringify(user, null, 2) : 'No user found'}
                </pre>
              </div>
              <div>
                <h3 className="font-medium">Session:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
                  {session ? JSON.stringify(session, null, 2) : 'No session found'}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Direct Supabase Check</h2>
          {directError ? (
            <div className="text-red-500">{directError}</div>
          ) : (
            <div>
              <h3 className="font-medium">Session:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
                {directSession ? JSON.stringify(directSession, null, 2) : 'No session found'}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Server Session Check</h2>
        {serverError ? (
          <div className="text-red-500">{serverError}</div>
        ) : (
          <div>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
              {serverSession ? JSON.stringify(serverSession, null, 2) : 'No data received'}
            </pre>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Cookies</h2>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
          {cookieString}
        </pre>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={clearAllAuth}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Clear All Auth Data
        </button>
        
        <button
          onClick={fixAuth}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Attempt to Fix Session
        </button>
        
        <Link
          href="/api/create-admin"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Create Admin User
        </Link>
        
        <Link
          href="/login"
          className="inline-block bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          Go to Login
        </Link>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg text-sm">
        <p>This page helps debug authentication issues by showing the current state of authentication from different sources.</p>
        <p className="mt-2">If you&apos;re experiencing problems, try clicking &quot;Clear All Auth Data&quot; and then log in again.</p>
      </div>
    </div>
  );
} 