import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST() {
  try {
    // Get the Supabase URL and anon key from environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing Supabase configuration' 
      }, { status: 500 });
    }
    
    // Create a Supabase client for the route handler
    const supabase = createRouteHandlerClient({ cookies });
    
    // Try to get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    // If we have a session, refresh it
    if (session) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Error refreshing session:', refreshError);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to refresh session',
          details: refreshError.message
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Session refreshed successfully',
        hasSession: !!refreshData.session,
        user: refreshData.session?.user?.email
      });
    }
    
    // No session found, inform the client
    return NextResponse.json({ 
      success: false,
      message: 'No active session found to refresh',
    }, { status: 401 });
    
  } catch (error) {
    console.error('Error in fix-session route:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fix session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 