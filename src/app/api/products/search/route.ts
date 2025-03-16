import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q') || '';
    
    if (!q || q.length < 2) {
      return NextResponse.json({ 
        success: true, 
        data: [] 
      });
    }
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${q}%,barcode.ilike.%${q}%`)
      .limit(10);
    
    if (error) {
      console.error('Error searching products:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error: any) {
    console.error('Error in product search API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal Server Error'
    }, { status: 500 });
  }
} 