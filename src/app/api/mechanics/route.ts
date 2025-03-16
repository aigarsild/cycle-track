import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const active = searchParams.get('active');
    
    // Build query
    let query = supabase
      .from('mechanics')
      .select('*')
      .order('name');
    
    // Filter by active status if specified
    if (active === 'true') {
      query = query.eq('active', true);
    }
    
    // Get mechanics
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching mechanics:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error: any) {
    console.error('Error in mechanics API:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 