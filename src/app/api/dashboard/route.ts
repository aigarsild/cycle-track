import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import type { DashboardStats } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '30'; // Default to 30 days
    const days = parseInt(timeRange);

    // Get date from N days ago
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    const fromDateStr = fromDate.toISOString();

    // Get tickets counts
    const { data: tickets, error: ticketsError } = await supabase
      .from('service_tickets')
      .select('status, total_cost, created_at');

    if (ticketsError) {
      return NextResponse.json({ error: ticketsError.message }, { status: 500 });
    }

    // Filter tickets by time range
    const filteredTickets = tickets.filter(ticket => 
      new Date(ticket.created_at) >= fromDate
    );

    // Calculate statistics
    const todoCount = filteredTickets.filter(ticket => ticket.status === 'todo').length;
    const inProgressCount = filteredTickets.filter(ticket => ticket.status === 'in-progress').length;
    const waitingForPartsCount = filteredTickets.filter(ticket => ticket.status === 'waiting-for-parts').length;
    const doneCount = filteredTickets.filter(ticket => ticket.status === 'done').length;

    // Calculate revenue from completed tickets
    const totalRevenue = filteredTickets
      .filter(ticket => ticket.status === 'done' && ticket.total_cost)
      .reduce((sum, ticket) => sum + (ticket.total_cost || 0), 0);

    // Estimate revenue from tickets that are not yet completed
    // Assume an average of $150 per ticket for estimation
    const averageTicketValue = 150;
    const estimatedRevenue = (todoCount + inProgressCount + waitingForPartsCount) * averageTicketValue;

    const stats: DashboardStats = {
      todoCount,
      inProgressCount,
      waitingForPartsCount,
      doneCount,
      totalRevenue,
      estimatedRevenue
    };

    return NextResponse.json({ stats });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: error?.message },
      { status: 500 }
    );
  }
} 