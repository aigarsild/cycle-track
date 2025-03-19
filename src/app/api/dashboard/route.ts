import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import type { DashboardStats } from '@/types';

export const dynamic = 'force-dynamic';

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

    // Count tickets in different statuses
    const { data: todoData } = await supabase
      .from('service_tickets')
      .select('id')
      .eq('status', 'todo')
      .gte('created_at', fromDateStr);
    
    const { data: inProgressData } = await supabase
      .from('service_tickets')
      .select('id')
      .eq('status', 'in-progress')
      .gte('created_at', fromDateStr);
    
    const { data: waitingForPartsData } = await supabase
      .from('service_tickets')
      .select('id')
      .eq('status', 'waiting-for-parts')
      .gte('created_at', fromDateStr);
    
    const { data: doneData } = await supabase
      .from('service_tickets')
      .select('id')
      .eq('status', 'done')
      .gte('created_at', fromDateStr);

    // Add query for archived tickets
    const { data: archivedData } = await supabase
      .from('service_tickets')
      .select('id')
      .eq('status', 'archived')
      .gte('created_at', fromDateStr);
    
    // Get completed tickets with revenue information
    const { data: revenueData } = await supabase
      .from('service_tickets')
      .select('total_cost')
      .eq('status', 'done')
      .gte('created_at', fromDateStr);
    
    // Set counts and calculate totals
    const todoCount = todoData?.length || 0;
    const inProgressCount = inProgressData?.length || 0;
    const waitingForPartsCount = waitingForPartsData?.length || 0;
    const doneCount = doneData?.length || 0;
    const archivedCount = archivedData?.length || 0;

    // Calculate revenue from completed tickets
    const totalRevenue = (revenueData || [])
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
      archivedCount,
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