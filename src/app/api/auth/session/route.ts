import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST() {
  try {
    // Create a Supabase client for the route handler
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Return session information
    return NextResponse.json({ 
      success: true,
      message: 'Session refreshed',
      isAuthenticated: !!session,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error refreshing session:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to refresh session' 
    }, { status: 500 });
  }
} 