import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

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
    
    // Validate status if present
    if (updates.status && !['todo', 'in-progress', 'waiting-for-parts', 'done', 'archived'].includes(updates.status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    // Map client-side field names to database column names
    const dbUpdates: any = {};
    
    if (updates.status) {
      dbUpdates.status = updates.status;
    }
    
    // If moving to done status and completionDate is provided, use that
    // Otherwise, if moving to done status, use current timestamp
    if (updates.status === 'done') {
      if (updates.completionDate) {
        // Use the provided completion date
        dbUpdates.updated_at = updates.completionDate;
      } else {
        // Use current timestamp
        dbUpdates.updated_at = new Date().toISOString();
      }
      console.log(`Setting updated_at to ${dbUpdates.updated_at} for done status`);
    }
    
    // Handle status change comment if provided
    if (updates.newComment) {
      // First, fetch the current ticket with comments
      const { data: ticket, error: fetchError } = await supabase
        .from('service_tickets')
        .select('comments')
        .eq('id', ticketId)
        .single();

      if (fetchError) {
        console.error('Error fetching ticket comments:', fetchError);
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }

      // Prepare the updated comments array
      const currentComments = ticket.comments || [];
      dbUpdates.comments = [...currentComments, updates.newComment];
    }
    
    // Log the update operation
    console.log(`Updating ticket ${ticketId} with:`, dbUpdates);
    
    // Update the ticket
    const { data, error } = await supabase
      .from('service_tickets')
      .update(dbUpdates)
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
    console.error('Unexpected error updating ticket status:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred', 
      details: error.message 
    }, { status: 500 });
  }
} 