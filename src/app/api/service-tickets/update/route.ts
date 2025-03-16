import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { ticketId, updates } = body;
    
    // Validate required fields
    if (!ticketId) {
      return NextResponse.json({ error: 'Missing ticketId' }, { status: 400 });
    }
    
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Updates object is required' }, { status: 400 });
    }
    
    // Log the update operation
    console.log(`Updating ticket ${ticketId} with:`, updates);
    
    // Allowed fields to update
    const allowedFields = [
      'status',
      'mechanic_id',
      'additionalDetails', 
      'totalCost',
      'completionDate'
    ];
    
    // Filter out non-allowed fields
    const filteredUpdates: Record<string, any> = {};
    
    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    }
    
    // Update the ticket
    const { data, error } = await supabase
      .from('service_tickets')
      .update(filteredUpdates)
      .eq('id', ticketId)
      .select();
    
    if (error) {
      console.error('Error updating ticket:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Ticket updated successfully',
      ticket: data?.[0] || null
    });
    
  } catch (error: any) {
    console.error('Unexpected error updating ticket:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred', 
      details: error.message 
    }, { status: 500 });
  }
} 