import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ticketId = searchParams.get('ticketId');
    
    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      );
    }
    
    console.log('Generating receipt for ticket:', ticketId);
    
    // Fetch the ticket with customer and service request data
    const { data: ticket, error: ticketError } = await supabase
      .from('service_tickets')
      .select(`
        *,
        service_request:service_request_id(
          *,
          customer:customer_id(*)
        )
      `)
      .eq('id', ticketId)
      .single();
    
    if (ticketError) {
      console.error('Error fetching ticket:', ticketError);
      return NextResponse.json(
        { error: 'Failed to fetch ticket data', details: ticketError.message },
        { status: 500 }
      );
    }
    
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    // Extract customer and service details from the ticket
    const customer = ticket.service_request?.customer || {};
    const serviceRequest = ticket.service_request || {};
    
    // Create a PDF with 80mm width (approximately 226.8 points)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200] // 80mm width, 200mm height
    });
    
    // Set initial position
    let y = 10;
    
    // Header
    doc.setFontSize(14);
    doc.text('Cycle Track Shop', 40, y, { align: 'center' });
    y += 7;
    
    doc.setFontSize(10);
    doc.text('Service Receipt', 40, y, { align: 'center' });
    y += 10;
    
    // Customer info
    const customerName = customer.name || 'Unknown Customer';
    const customerEmail = customer.email || '';
    const customerPhone = customer.phone || '';
    
    doc.setFontSize(9);
    doc.text(`Customer: ${customerName}`, 5, y);
    y += 5;
    
    if (customerEmail) {
      doc.text(`Email: ${customerEmail}`, 5, y);
      y += 5;
    }
    
    if (customerPhone) {
      doc.text(`Phone: ${customerPhone}`, 5, y);
      y += 5;
    }
    
    // Service info
    doc.text(`Ticket ID: ${ticketId}`, 5, y);
    y += 5;
    
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 5, y);
    y += 5;
    
    const equipmentBrand = serviceRequest.equipment_brand || 'Unknown';
    const serviceType = serviceRequest.service_type || 'Service';
    
    doc.text(`Equipment: ${equipmentBrand}`, 5, y);
    y += 5;
    
    doc.text(`Service Type: ${serviceType}`, 5, y);
    y += 10;
    
    // Use ticket.totalCost if available, otherwise use a default
    const totalCost = ticket.total_cost || ticket.totalCost || 0;
    
    // Items section
    doc.setFontSize(9);
    doc.text('Item', 5, y);
    doc.text('Price', 75, y, { align: 'right' });
    y += 5;
    
    // Draw a line
    doc.line(5, y, 75, y);
    y += 5;
    
    // Add the service as the main item
    doc.setFontSize(8);
    doc.text(`${serviceType} - ${equipmentBrand}`, 5, y);
    doc.text(`$${totalCost.toFixed(2)}`, 75, y, { align: 'right' });
    y += 10;
    
    // Draw another line
    doc.line(5, y, 75, y);
    y += 5;
    
    // Totals section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', 40, y);
    doc.text(`$${totalCost.toFixed(2)}`, 75, y, { align: 'right' });
    y += 10;
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your business!', 40, y, { align: 'center' });
    y += 4;
    doc.text('Cycle Track Shop', 40, y, { align: 'center' });
    y += 4;
    doc.text('123 Bike Lane, Cycling City', 40, y, { align: 'center' });
    
    // Store the receipt in the database
    const receipt = {
      items: [{
        id: `service-${ticketId}`,
        name: `${serviceType} - ${equipmentBrand}`,
        price: totalCost,
        quantity: 1,
        serviceFee: 0
      }],
      totalAmount: totalCost,
      generatedAt: new Date().toISOString(),
      pdfUrl: `/api/receipt/generate?ticketId=${ticketId}`
    };
    
    // Update the ticket with the receipt data
    const { error: updateError } = await supabase
      .from('service_tickets')
      .update({
        receipt
      })
      .eq('id', ticketId);
    
    if (updateError) {
      console.error('Error updating ticket with receipt:', updateError);
      // Continue anyway to return the PDF
    }
    
    // Output the PDF
    const pdfBuffer = Buffer.from(await doc.output('arraybuffer'));
    
    // Return the PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="receipt-${ticketId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF receipt:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF receipt', details: error?.message },
      { status: 500 }
    );
  }
} 