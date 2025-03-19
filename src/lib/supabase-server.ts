'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

// Use placeholders if environment variables are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY || '';

// Helper function to create server component supabase client
export const createServerSupabaseClient = () => {
  return createServerComponentClient({ cookies });
};

// Server-side admin client for operations requiring additional permissions
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Function to get the current session on the server
export async function getServerSession() {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Function to protect server routes
export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    redirect('/login');
  }
  return session;
} 