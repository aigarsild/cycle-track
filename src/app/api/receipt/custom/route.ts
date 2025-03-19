import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id') || 'SR-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    
    // Get shop settings from query parameters or use defaults
    const shopName = searchParams.get('shopName') || 'Kauplus Rattapood';
    const shopPhone = searchParams.get('shopPhone') || '56 86 17 63';
    const shopEmail = searchParams.get('shopEmail') || 'tere@kauplusrattapood.ee';
    const shopAddress = searchParams.get('shopAddress') || 'Vae 3a, Laagri, Saue vald';
    const customLogo = searchParams.get('logo');
    
    // Create a PDF with 80mm width
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200] // 80mm width, 200mm height
    });
    
    // Add function to draw bicycle logo
    const drawBicycleLogo = (x: number, y: number, width: number = 10) => {
      const scale = width / 10;
      
      // Draw the bicycle frame
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      
      // Main frame triangle
      doc.line(x, y, x + 8 * scale, y);
      doc.line(x, y, x + 4 * scale, y - 4 * scale);
      doc.line(x + 8 * scale, y, x + 4 * scale, y - 4 * scale);
      
      // Front fork
      doc.line(x + 8 * scale, y, x + 8 * scale, y + 2 * scale);
      
      // Draw wheels (circles)
      doc.circle(x, y, 3 * scale);
      doc.circle(x + 8 * scale, y, 3 * scale);
      
      // Draw handlebars
      doc.line(x + 8 * scale, y + 2 * scale, x + 10 * scale, y - 1 * scale);
      
      // Draw seat
      doc.line(x + 4 * scale, y - 4 * scale, x + 2 * scale, y - 5 * scale);
      doc.line(x + 2 * scale, y - 5 * scale, x + 4 * scale, y - 5 * scale);
    };
    
    // Set initial position
    let y = 15;
    
    // Add header with logo
    if (customLogo) {
      try {
        // Add custom logo from base64 string
        doc.addImage(customLogo, 'JPEG', 30, y - 10, 20, 20);
      } catch (err) {
        console.error('Error adding custom logo to PDF:', err);
        // Fallback to bicycle logo if custom logo fails
        drawBicycleLogo(25, y, 10);
      }
    } else {
      // Use default bicycle logo
      drawBicycleLogo(25, y, 10);
    }
    
    // Split shop name into two parts if it contains a space
    let shopNameParts = shopName.split(' ');
    let firstPart = shopNameParts[0] || '';
    let secondPart = shopNameParts.slice(1).join(' ') || '';
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(firstPart, 40, y - 5);
    doc.text(secondPart, 40, y + 5);
    y += 15;
    
    // Date and receipt ID
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    // Get current date in the format "Fri, jan 17, 2025, 00:26:31"
    const now = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const formattedDate = `${dayNames[now.getDay()]}, ${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    doc.text(formattedDate, 40, y, { align: 'center' });
    y += 7;
    
    doc.text(`Reciept: ${id}`, 40, y, { align: 'center' });
    y += 10;
    
    // Add horizontal line
    doc.setDrawColor(0, 0, 0);
    doc.line(5, y, 75, y);
    y += 10;
    
    // Customer info
    const customerName = searchParams.get('customerName') || 'Aigar Sild';
    const bikeBrand = searchParams.get('equipmentBrand') || 'Gt chucker';
    const customerPhone = searchParams.get('customerPhone') || '56 86 17 63';
    const customerEmail = searchParams.get('customerEmail') || 'Aigarsild@gmail.com';
    const serviceType = searchParams.get('serviceType') || 'Täishooldus';
    const mechanic = searchParams.get('mechanic') || 'Aigar';
    const details = searchParams.get('details') || 'tere';
    
    // Define field labels and values
    const fields = [
      { label: 'Name:', value: customerName },
      { label: 'Bike:', value: bikeBrand },
      { label: 'Phone:', value: customerPhone },
      { label: 'Email:', value: customerEmail },
      { label: 'Service type:', value: serviceType },
      { label: 'Worker:', value: mechanic }
    ];
    
    // Add fields with right-aligned values
    doc.setFontSize(12); // Increased font size
    for (const field of fields) {
      doc.setFont('helvetica', 'normal');
      doc.text(field.label, 5, y);
      
      doc.setFont('helvetica', 'bold'); // Make the value bold
      doc.text(field.value, 75, y, { align: 'right' });
      y += 8; // Increased spacing between lines
      
      doc.setDrawColor(220, 220, 220);
      doc.line(5, y - 3, 75, y - 3);
    }
    
    // Add details field
    y += 3;
    doc.setFont('helvetica', 'normal');
    doc.text('Details:', 5, y);
    y += 7;
    
    doc.setFont('helvetica', 'bold'); // Details value is bold
    doc.text(details, 5, y);
    y += 15;
    
    // Add bottom horizontal line
    doc.setDrawColor(0, 0, 0);
    doc.line(5, y, 75, y);
    y += 10;
    
    // Footer
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Shop', 40, y, { align: 'center' });
    y += 7;
    
    doc.text(shopPhone, 40, y, { align: 'center' });
    y += 7;
    
    doc.text(shopEmail, 40, y, { align: 'center' });
    y += 7;
    
    doc.text(shopAddress, 40, y, { align: 'center' });
    y += 15;
    
    // Footer logo
    if (customLogo) {
      try {
        // Add custom logo from base64 string
        doc.addImage(customLogo, 'JPEG', 30, y - 5, 20, 20);
      } catch (err) {
        // Fallback to bicycle logo if custom logo fails
        drawBicycleLogo(35, y, 10);
      }
    } else {
      // Use default bicycle logo
      drawBicycleLogo(35, y, 10);
    }
    
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