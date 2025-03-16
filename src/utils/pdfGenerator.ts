import { jsPDF } from 'jspdf';
import { ServiceTicket, Product } from '@/types';

export const generateServiceReceipt = (ticket: ServiceTicket): string => {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.text('Bike Shop Service Receipt', 105, 20, { align: 'center' });
  
  // Add receipt details
  doc.setFontSize(12);
  doc.text(`Receipt ID: ${ticket.id}`, 20, 40);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
  
  // Add customer details
  doc.setFontSize(14);
  doc.text('Customer Details', 20, 70);
  doc.setFontSize(12);
  doc.text(`Name: ${ticket.customer.name}`, 20, 80);
  doc.text(`Email: ${ticket.customer.email}`, 20, 90);
  doc.text(`Phone: ${ticket.customer.phone}`, 20, 100);
  
  // Add service details
  doc.setFontSize(14);
  doc.text('Service Details', 20, 120);
  doc.setFontSize(12);
  doc.text(`Equipment Brand: ${ticket.equipmentBrand}`, 20, 130);
  doc.text(`Service Type: ${ticket.serviceType}`, 20, 140);
  doc.text(`Recipient: ${ticket.recipient}`, 20, 150);
  doc.text(`Additional Details: ${ticket.additionalDetails}`, 20, 160);
  
  // Add parts used if available
  if (ticket.partsUsed && ticket.partsUsed.length > 0) {
    doc.setFontSize(14);
    doc.text('Parts Used', 20, 180);
    doc.setFontSize(12);
    
    let yPos = 190;
    let totalPartsCost = 0;
    
    ticket.partsUsed.forEach((part: Product, index: number) => {
      doc.text(`${index + 1}. ${part.name} - $${part.price.toFixed(2)}`, 20, yPos);
      totalPartsCost += part.price;
      yPos += 10;
    });
    
    doc.text(`Total Parts Cost: $${totalPartsCost.toFixed(2)}`, 20, yPos + 10);
  }
  
  // Add total cost if available
  if (ticket.totalCost) {
    doc.setFontSize(14);
    doc.text(`Total Service Cost: $${ticket.totalCost.toFixed(2)}`, 20, 220);
  }
  
  // Add footer
  doc.setFontSize(10);
  doc.text('Thank you for choosing our Bike Shop!', 105, 280, { align: 'center' });
  
  // Return the PDF as a data URL
  return doc.output('datauristring');
}; 