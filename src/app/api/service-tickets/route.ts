import { supabase, ensureDatabaseSchema } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import type { ServiceTicket } from '@/types';

// Fallback data for development if database isn't accessible
const mockServiceTickets: ServiceTicket[] = [
  {
    id: '1',
    customerId: '1',
    customer: {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '123-456-7890',
      marketingConsent: true,
      createdAt: '2023-01-15T10:00:00Z'
    },
    equipmentBrand: 'Trek',
    serviceType: 'Full Service',
    recipient: 'Self',
    additionalDetails: 'Bike is making a clicking noise when pedaling',
    status: 'todo',
    createdAt: '2023-05-01T10:30:00Z',
    updatedAt: '2023-05-01T10:30:00Z',
    comments: ['Initial inspection shows possible issue with bottom bracket']
  },
  {
    id: '2',
    customerId: '2',
    customer: {
      id: '2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '234-567-8901',
      marketingConsent: false,
      createdAt: '2023-02-10T14:30:00Z'
    },
    equipmentBrand: 'Specialized',
    serviceType: 'Simple Service',
    recipient: 'Gift',
    additionalDetails: 'Brakes need adjustment, gears slipping',
    status: 'in-progress',
    createdAt: '2023-05-02T14:00:00Z',
    updatedAt: '2023-05-03T09:15:00Z',
    mechanicId: 'M1',
    comments: ['Brake pads replaced on front and rear', 'Derailleur adjustment still needed']
  },
  {
    id: '3',
    customerId: '3',
    customer: {
      id: '3',
      name: 'Michael Johnson',
      email: 'michael@example.com',
      phone: '345-678-9012',
      marketingConsent: true,
      createdAt: '2023-03-05T09:15:00Z'
    },
    equipmentBrand: 'Giant',
    serviceType: 'Other',
    recipient: 'Self',
    additionalDetails: 'Wheel truing and new tires installation',
    status: 'waiting-for-parts',
    createdAt: '2023-05-04T11:30:00Z',
    updatedAt: '2023-05-05T13:45:00Z',
    partsUsed: [{
      id: '1',
      name: 'Bike Chain',
      category: 'Parts',
      barcode: 'BC-12345',
      price: 25.99,
      description: 'High-quality bike chain',
      createdAt: '2023-01-01T00:00:00Z'
    }],
    comments: ['Waiting for Schwalbe Marathon tires to arrive']
  },
  {
    id: '4',
    customerId: '1',
    customer: {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '123-456-7890',
      marketingConsent: true,
      createdAt: '2023-01-15T10:00:00Z'
    },
    equipmentBrand: 'Cannondale',
    serviceType: 'Full Service',
    recipient: 'Self',
    additionalDetails: 'Annual maintenance',
    status: 'done',
    createdAt: '2023-04-15T09:00:00Z',
    updatedAt: '2023-04-18T16:30:00Z',
    completionDate: '2023-04-18T16:30:00Z',
    totalCost: 120.50,
    mechanicId: 'M2',
    partsUsed: [{
      id: '1',
      name: 'Bike Chain',
      category: 'Parts',
      barcode: 'BC-12345',
      price: 25.99,
      description: 'High-quality bike chain',
      createdAt: '2023-01-01T00:00:00Z'
    }],
    comments: ['Complete service performed', 'New chain installed', 'All bearings cleaned and regreased', 'Ready for pickup']
  },
  {
    id: '5',
    customerId: '2',
    customer: {
      id: '2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '234-567-8901',
      marketingConsent: false,
      createdAt: '2023-02-10T14:30:00Z'
    },
    equipmentBrand: 'Cervelo',
    serviceType: 'Simple Service',
    recipient: 'Self',
    additionalDetails: 'Derailleur adjustment',
    status: 'todo',
    createdAt: '2023-05-06T13:15:00Z',
    updatedAt: '2023-05-06T13:15:00Z',
    comments: []
  }
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    // Ensure the database schema exists
    await ensureDatabaseSchema();

    // Try to fetch from Supabase
    try {
      console.log('Attempting to fetch data from Supabase...');
      const query = supabase
        .from('service_tickets')
        .select(`
          *,
          service_request:service_request_id(*,
            customer:customer_id(*)
          )
        `);

      if (status) {
        query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
      }

      console.log('Raw data received:', data ? `${data.length} tickets` : 'No data');
      if (data && data.length > 0) {
        console.log('First ticket raw data:', JSON.stringify(data[0], null, 2));
      }

      if (!error && data && data.length > 0) {
        // Transform the data to match our frontend types
        const transformedData = data.map((ticket: any) => {
          // Extract customer data or create fallbacks
          let customerData = {
            id: 'unknown',
            name: 'Unknown Customer',
            email: 'no-email@example.com',
            phone: 'No phone number',
            marketingConsent: false,
            createdAt: ticket.created_at
          };

          // Try to get customer from the nested object
          if (ticket.service_request?.customer) {
            customerData = {
              id: ticket.service_request.customer.id || customerData.id,
              name: ticket.service_request.customer.name || customerData.name,
              email: ticket.service_request.customer.email || customerData.email,
              phone: ticket.service_request.customer.phone || customerData.phone,
              marketingConsent: ticket.service_request.customer.marketing_consent || customerData.marketingConsent,
              createdAt: ticket.service_request.customer.created_at || customerData.createdAt
            };
          }

          return {
            id: ticket.id,
            customerId: ticket.service_request?.customer_id || 'unknown',
            equipmentBrand: ticket.service_request?.equipment_brand || 'Unknown',
            serviceType: ticket.service_request?.service_type || 'Other',
            recipient: ticket.service_request?.recipient || 'Self',
            additionalDetails: ticket.service_request?.additional_details || '',
            status: ticket.status,
            createdAt: ticket.created_at,
            updatedAt: ticket.updated_at,
            customer: customerData,
            partsUsed: ticket.parts_used || [],
            mechanicId: ticket.mechanic_id,
            completionDate: ticket.completion_date,
            totalCost: ticket.total_cost,
            comments: ticket.comments || []
          };
        });

        console.log('Transformed first ticket:', JSON.stringify(transformedData[0], null, 2));
        return NextResponse.json({ tickets: transformedData });
      }
    } catch (dbError) {
      console.error('Database error, falling back to mock data:', dbError);
    }

    // If we got here, either there was a database error or no results, use mock data
    const filteredTickets = status
      ? mockServiceTickets.filter(ticket => ticket.status === status)
      : mockServiceTickets;
    
    return NextResponse.json({ tickets: filteredTickets });
    
  } catch (error: any) {
    console.error('Error in service-tickets API:', error);
    return NextResponse.json(
      { tickets: mockServiceTickets },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceRequest, customer } = body;

    // First check if customer exists
    let customerId = null;
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', customer.email)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;

      // Update customer if it exists
      await supabase
        .from('customers')
        .update({
          name: customer.name,
          phone: customer.phone,
          marketing_consent: customer.marketingConsent
        })
        .eq('id', customerId);
    } else {
      // Create new customer
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          marketing_consent: customer.marketingConsent
        })
        .select()
        .single();

      if (customerError) {
        return NextResponse.json(
          { error: 'Error creating customer', details: customerError.message },
          { status: 500 }
        );
      }

      customerId = newCustomer.id;
    }

    // Create service request
    const { data: serviceRequestData, error: serviceRequestError } = await supabase
      .from('service_requests')
      .insert({
        customer_id: customerId,
        equipment_brand: serviceRequest.equipmentBrand,
        service_type: serviceRequest.serviceType,
        recipient: serviceRequest.recipient,
        additional_details: serviceRequest.additionalDetails
      })
      .select()
      .single();

    if (serviceRequestError) {
      return NextResponse.json(
        { error: 'Error creating service request', details: serviceRequestError.message },
        { status: 500 }
      );
    }

    // Create service ticket
    const { data: ticketData, error: ticketError } = await supabase
      .from('service_tickets')
      .insert({
        service_request_id: serviceRequestData.id,
        status: 'todo',
        comments: []
      })
      .select()
      .single();

    if (ticketError) {
      return NextResponse.json(
        { error: 'Error creating service ticket', details: ticketError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ticket: ticketData,
      serviceRequest: serviceRequestData,
      customer: {
        id: customerId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        marketingConsent: customer.marketingConsent
      }
    }, { status: 201 });
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
    const { id, status, partsUsed, mechanicId, totalCost, comments } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    const updates: any = {};
    
    if (status) updates.status = status;
    if (partsUsed) updates.parts_used = partsUsed;
    if (mechanicId) updates.mechanic_id = mechanicId;
    if (totalCost) updates.total_cost = totalCost;
    if (comments) updates.comments = comments;
    
    // If status is 'done', set completion date
    if (status === 'done') {
      updates.completion_date = new Date().toISOString();
    }

    try {
      // Try to update in Supabase
      const { data, error } = await supabase
        .from('service_tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error) {
        return NextResponse.json({ ticket: data });
      }
    } catch (dbError) {
      console.error('Database update error, using client-side only:', dbError);
    }

    // If database update failed, use mock data for demonstration
    if (comments) {
      // Find and update the ticket in our mock data
      const ticketIndex = mockServiceTickets.findIndex(t => t.id === id);
      if (ticketIndex !== -1) {
        // We've verified the index exists, so the ticket definitely exists at this point
        const ticket = mockServiceTickets[ticketIndex] as ServiceTicket;
        
        // Initialize comments if needed
        if (!ticket.comments) {
          ticket.comments = [];
        }
        
        // Update comments
        ticket.comments = comments;
        
        return NextResponse.json({ 
          success: true,
          ticket
        });
      }
    }

    // Generic success response for other updates
    return NextResponse.json({ 
      success: true,
      message: 'Status updated in UI only. Database update not available.'
    });
    
  } catch (error: any) {
    console.error('Error in PATCH:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error?.message },
      { status: 500 }
    );
  }
} 