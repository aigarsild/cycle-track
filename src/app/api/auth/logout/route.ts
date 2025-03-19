import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // Perform the signout operation
    await supabase.auth.signOut();
    
    // Clear all supabase cookies
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    
    for (const cookie of allCookies) {
      if (cookie.name.includes('supabase')) {
        console.log(`Clearing cookie: ${cookie.name}`);
        cookies().delete(cookie.name);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { error: 'Failed to log out' },
      { status: 500 }
    );
  }
} 