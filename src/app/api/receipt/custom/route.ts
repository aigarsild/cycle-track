import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id') || 'SR-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const isPreview = searchParams.get('preview') === 'true';
    
    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Fetch shop settings from database
    const { data: shopSettings, error: settingsError } = await supabase
      .from('shop_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (settingsError) {
      console.error('Error fetching shop settings:', settingsError);
    }
    
    // Use shop settings from database or defaults
    const shopName = shopSettings?.shop_name || 'Kauplus Rattapood';
    const shopPhone = shopSettings?.shop_phone || '56 86 17 63';
    const shopEmail = shopSettings?.shop_email || 'tere@kauplusrattapood.ee';
    const shopAddress = shopSettings?.shop_address || 'Vae 3a, Laagri, Saue vald';
    const customLogo = shopSettings?.logo || null;
    
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
    
    // Set initial position and consistent padding
    const sidePadding = 5;
    const contentWidth = 70; // 80mm - 2*sidePadding
    let y = 15;
    
    // Add header with logo only
    if (customLogo) {
      try {
        // Add custom logo from base64 string
        doc.addImage(customLogo, 'JPEG', 30, y - 10, 20, 20);
      } catch (err) {
        console.error('Error adding custom logo to PDF:', err);
        // Fallback to bicycle logo if custom logo fails
        drawBicycleLogo(40, y, 12);
      }
    } else {
      // Use default bicycle logo
      drawBicycleLogo(40, y, 12);
    }
    
    y += 20; // Space after logo
    
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
    
    doc.text(`Receipt: ${id}`, 40, y, { align: 'center' });
    y += 12;
    
    // Add horizontal line
    doc.setDrawColor(0, 0, 0);
    doc.line(sidePadding, y, 80 - sidePadding, y);
    y += 12;
    
    // Use either URL parameters or sample data for customer info
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
    doc.setFontSize(12); // Consistent font size
    for (const field of fields) {
      doc.setFont('helvetica', 'normal');
      doc.text(field.label, sidePadding, y);
      
      doc.setFont('helvetica', 'bold'); // Make the value bold
      doc.text(field.value, 80 - sidePadding, y, { align: 'right' });
      y += 10; // More spacing between lines
    }
    
    // Add details field
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.text('Details:', sidePadding, y);
    y += 7;
    
    doc.setFont('helvetica', 'bold'); // Details value is bold
    doc.text(details, sidePadding, y);
    y += 15;
    
    // Add bottom horizontal line
    doc.setDrawColor(0, 0, 0);
    doc.line(sidePadding, y, 80 - sidePadding, y);
    y += 12;
    
    // Footer with shop info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(shopName, 40, y, { align: 'center' });
    y += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
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
        drawBicycleLogo(40, y, 10);
      }
    } else {
      // Use default bicycle logo
      drawBicycleLogo(40, y, 10);
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