import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Fetch settings from database
  const { data, error } = await supabase
    .from('shop_settings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error fetching shop settings:', error);
    return NextResponse.json({ error: 'Failed to fetch shop settings' }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { shopName, shopPhone, shopEmail, shopAddress, logo } = await request.json();
    
    // Get existing settings first
    const { data: existingSettings } = await supabase
      .from('shop_settings')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    let result;
    
    if (existingSettings) {
      // Update existing settings
      result = await supabase
        .from('shop_settings')
        .update({
          shop_name: shopName,
          shop_phone: shopPhone,
          shop_email: shopEmail,
          shop_address: shopAddress,
          logo,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id)
        .select()
        .single();
    } else {
      // Create new settings
      result = await supabase
        .from('shop_settings')
        .insert({
          shop_name: shopName,
          shop_phone: shopPhone,
          shop_email: shopEmail,
          shop_address: shopAddress,
          logo
        })
        .select()
        .single();
    }
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error('Error saving shop settings:', error);
    return NextResponse.json(
      { error: 'Failed to save shop settings', details: error?.message },
      { status: 500 }
    );
  }
} 