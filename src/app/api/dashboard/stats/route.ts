import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Fetch all service tickets
    const { data: tickets, error: ticketsError } = await supabase
      .from('service_tickets')
      .select('*, customer:customers(*)')
      .order('createdAt', { ascending: false });
    
    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError);
      return NextResponse.json(
        { error: 'Failed to fetch tickets', details: ticketsError.message },
        { status: 500 }
      );
    }
    
    // Count tickets by status
    const todoCount = tickets.filter(ticket => ticket.status === 'todo').length;
    const inProgressCount = tickets.filter(ticket => ticket.status === 'in-progress').length;
    const waitingForPartsCount = tickets.filter(ticket => ticket.status === 'waiting-for-parts').length;
    const doneCount = tickets.filter(ticket => ticket.status === 'done').length;
    const archivedCount = tickets.filter(ticket => ticket.status === 'archived').length;
    
    // Calculate revenue from completed and archived tickets
    const completedTickets = tickets.filter(
      ticket => ticket.status === 'done' || ticket.status === 'archived'
    );
    
    const totalRevenue = completedTickets.reduce((sum, ticket) => {
      // Use receipt total if available
      if (ticket.receipt && ticket.receipt.totalAmount) {
        return sum + ticket.receipt.totalAmount;
      }
      // Otherwise use ticket totalCost if available
      if (ticket.totalCost) {
        return sum + ticket.totalCost;
      }
      return sum;
    }, 0);
    
    // Calculate estimated revenue from in-progress tickets
    const inProgressTickets = tickets.filter(
      ticket => ticket.status === 'in-progress' || ticket.status === 'waiting-for-parts'
    );
    
    // Estimate as average revenue per completed ticket * number of in-progress tickets
    let estimatedRevenue = 0;
    if (completedTickets.length > 0) {
      const averageRevenue = totalRevenue / completedTickets.length;
      estimatedRevenue = averageRevenue * inProgressTickets.length;
    }
    
    return NextResponse.json({
      todoCount,
      inProgressCount,
      waitingForPartsCount,
      doneCount,
      archivedCount,
      totalRevenue,
      estimatedRevenue,
      success: true
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', details: error?.message },
      { status: 500 }
    );
  }
} 