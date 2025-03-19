'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';

export default function SignOutButton() {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return null; // Don't render anything if not authenticated
  }

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      console.log('SignOutButton: Signing out user...');
      
      // Call the signOut method from AuthProvider
      await signOut();
      console.log('SignOutButton: Sign out completed, redirecting to login');
      
      // Additional server-side logout for extra assurance
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Redirect to login page after a small delay
      setTimeout(() => {
        // Force a full page reload to clear any state
        window.location.href = '/login';
      }, 500);
      
    } catch (error) {
      console.error('Error signing out:', error);
      setIsLoading(false);
      
      // If there's an error, force reload anyway
      window.location.href = '/clear-cache';
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Signing Out...' : 'Sign Out'}
    </button>
  );
} 