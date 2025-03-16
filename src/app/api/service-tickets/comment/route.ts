import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, comment } = body;

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== 'string') {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
    }

    // First, fetch the current ticket with comments
    const { data: ticket, error: fetchError } = await supabase
      .from('service_tickets')
      .select('comments')
      .eq('id', ticketId)
      .single();

    if (fetchError) {
      console.error('Error fetching ticket:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch ticket', details: fetchError.message },
        { status: 500 }
      );
    }

    // Prepare the updated comments array
    const currentComments = ticket.comments || [];
    const updatedComments = [...currentComments, comment];

    // Update the ticket with the new comment
    const { data, error } = await supabase
      .from('service_tickets')
      .update({
        comments: updatedComments
      })
      .eq('id', ticketId)
      .select();

    if (error) {
      console.error('Error adding comment to ticket:', error);
      return NextResponse.json(
        { error: 'Failed to add comment', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Comment added successfully',
      data
    });
  } catch (error: any) {
    console.error('Error in comment API:', error);
    return NextResponse.json(
      { error: 'Failed to add comment', details: error?.message },
      { status: 500 }
    );
  }
} 