import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category');
    const lowStock = searchParams.get('lowStock') === 'true';
    
    let supabaseQuery = supabase
      .from('products')
      .select('*');
    
    if (query) {
      supabaseQuery = supabaseQuery.or(
        `name.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`
      );
    }
    
    if (category) {
      supabaseQuery = supabaseQuery.eq('category', category);
    }
    
    if (lowStock) {
      supabaseQuery = supabaseQuery.lt('stock', 10);
    }
    
    const { data, error } = await supabaseQuery
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ products: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, price, stock, barcode, description } = body;
    
    if (!name || !category || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        category,
        price,
        stock,
        barcode,
        description,
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: error?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, category, price, stock, barcode, description } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (price !== undefined) updates.price = price;
    if (stock !== undefined) updates.stock = stock;
    if (barcode !== undefined) updates.barcode = barcode;
    if (description !== undefined) updates.description = description;
    
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ product: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: error?.message },
      { status: 500 }
    );
  }
} 