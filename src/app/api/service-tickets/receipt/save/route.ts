import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, receiptData, pdfUrl } = body;

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    // Let's log what we're trying to save
    console.log('Saving receipt to ticket:', ticketId);
    console.log('Receipt data:', JSON.stringify(receiptData, null, 2));

    // Update the service ticket with receipt data
    const { data, error } = await supabase
      .from('service_tickets')
      .update({
        receipt: {
          items: receiptData.items || [],
          totalAmount: receiptData.totalAmount || 0,
          generatedAt: new Date().toISOString(),
          mechanic: receiptData.mechanic || '',
          pdfUrl: pdfUrl || ''
        }
      })
      .eq('id', ticketId)
      .select();

    if (error) {
      console.error('Error saving receipt to ticket:', error);
      return NextResponse.json(
        { error: 'Failed to save receipt to ticket', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Receipt saved to ticket',
      data
    });
  } catch (error: any) {
    console.error('Error saving receipt to ticket:', error);
    return NextResponse.json(
      { error: 'Failed to save receipt to ticket', details: error?.message },
      { status: 500 }
    );
  }
} 