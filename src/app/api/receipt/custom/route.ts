import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Receipt ID is required' },
        { status: 400 }
      );
    }
    
    console.log('Generating receipt for:', id);
    
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
    const customerName = searchParams.get('customerName') || 'Counter Sale';
    const customerEmail = searchParams.get('customerEmail') || '';
    const customerPhone = searchParams.get('customerPhone') || '';
    
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
    doc.text(`Receipt ID: ${id}`, 5, y);
    y += 5;
    
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 5, y);
    y += 5;
    
    const equipmentBrand = searchParams.get('equipmentBrand') || 'Various';
    const serviceType = searchParams.get('serviceType') || 'Service';
    const mechanic = searchParams.get('mechanic') || '';
    
    doc.text(`Equipment: ${equipmentBrand}`, 5, y);
    y += 5;
    
    doc.text(`Service Type: ${serviceType}`, 5, y);
    y += 5;
    
    if (mechanic) {
      doc.text(`Mechanic: ${mechanic}`, 5, y);
      y += 5;
    }
    y += 5;
    
    // Items header
    doc.setFontSize(9);
    doc.text('Item', 5, y);
    doc.text('Qty', 45, y, { align: 'right' });
    doc.text('Price', 65, y, { align: 'right' });
    doc.text('Total', 75, y, { align: 'right' });
    y += 5;
    
    // Draw a line
    doc.line(5, y, 75, y);
    y += 5;
    
    // Initialize totals
    let subtotal = 0;
    let serviceFeeTotal = 0;
    
    // Parse and add items if they exist
    try {
      const itemsParam = searchParams.get('items');
      if (itemsParam) {
        const items = JSON.parse(decodeURIComponent(itemsParam));
        
        if (Array.isArray(items)) {
          for (const item of items) {
            const name = item.name || 'Unnamed item';
            const quantity = item.quantity || 1;
            const price = item.price || 0;
            const serviceFee = item.serviceFee || 0;
            const itemTotal = (price * quantity) + (serviceFee * quantity);
            
            // Add the item to the PDF
            doc.setFontSize(8);
            
            // Item name might be long - wrap it
            const nameLines = doc.splitTextToSize(name, 40);
            doc.text(nameLines, 5, y);
            
            // Move down if there are multiple lines
            const nameHeight = nameLines.length * 4;
            
            // Add the rest of the info
            doc.text(`${quantity}`, 45, y, { align: 'right' });
            doc.text(`$${price.toFixed(2)}`, 65, y, { align: 'right' });
            doc.text(`$${itemTotal.toFixed(2)}`, 75, y, { align: 'right' });
            
            y += Math.max(nameHeight, 5);
            
            // Add service fee if present
            if (serviceFee > 0) {
              doc.text(`- Service fee`, 10, y);
              doc.text(`$${serviceFee.toFixed(2)}`, 65, y, { align: 'right' });
              y += 4;
            }
            
            // Draw a light line between items
            doc.setDrawColor(200, 200, 200);
            doc.line(5, y, 75, y);
            y += 4;
            
            // Update totals
            subtotal += price * quantity;
            serviceFeeTotal += serviceFee * quantity;
          }
        }
      }
    } catch (error) {
      console.error('Error parsing items:', error);
      // Just continue with empty items
    }
    
    // Totals section
    y += 2;
    doc.setFontSize(9);
    doc.setDrawColor(0, 0, 0);
    
    // Subtotal
    doc.text('Subtotal:', 40, y);
    doc.text(`$${subtotal.toFixed(2)}`, 75, y, { align: 'right' });
    y += 5;
    
    // Service fee
    if (serviceFeeTotal > 0) {
      doc.text('Service Fees:', 40, y);
      doc.text(`$${serviceFeeTotal.toFixed(2)}`, 75, y, { align: 'right' });
      y += 5;
    }
    
    // Tax (if needed)
    // const tax = (subtotal + serviceFeeTotal) * 0.1; // 10% tax example
    // doc.text('Tax (10%):', 40, y);
    // doc.text(`$${tax.toFixed(2)}`, 75, y, { align: 'right' });
    // y += 5;
    
    // Grand total
    const grandTotal = subtotal + serviceFeeTotal;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', 40, y);
    doc.text(`$${grandTotal.toFixed(2)}`, 75, y, { align: 'right' });
    y += 10;
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your business!', 40, y, { align: 'center' });
    y += 4;
    doc.text('Cycle Track Shop', 40, y, { align: 'center' });
    y += 4;
    doc.text('123 Bike Lane, Cycling City', 40, y, { align: 'center' });
    
    // Output the PDF
    const pdfBuffer = Buffer.from(await doc.output('arraybuffer'));
    
    // Return the PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="receipt-${id}.pdf"`,
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