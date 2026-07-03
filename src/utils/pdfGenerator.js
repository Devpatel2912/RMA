import jsPDF from 'jspdf';

export const generateTicketPDF = (stageName, ticket) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });
  
  // A4 size in points: 595.28 x 841.89
  const startX = 30;
  const startY = 30;
  const width = 535;
  
  // Helper Functions
  const drawLine = (x1, y1, x2, y2) => {
    doc.setDrawColor(0);
    doc.line(x1, y1, x2, y2);
  };

  doc.setLineWidth(1);

  // Top header
  doc.setFillColor(0, 0, 0);
  doc.rect(startX, startY, 80, 50, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("AVXPERTS", startX + 40, startY + 30, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.text("AVXPERTS", startX + 90 + (width - 90)/2, startY + 15, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("16, Shiv Shyam Icon, Nr. Shree Ram Shadan, Karamsad, Anand, Gujarat 388325, India", startX + 90 + (width - 90)/2, startY + 30, { align: 'center' });
  doc.text("Mo. +91 7990103273 | Email. info@avxperts.co.in", startX + 90 + (width - 90)/2, startY + 42, { align: 'center' });

  // Outer border
  const boxY = startY + 55;
  doc.rect(startX, boxY, width, 700);

  // Titles Row
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Debit Memo", startX + 5, boxY + 12);
  doc.setFontSize(12);
  doc.text("TAX INVOICE", startX + width / 2, boxY + 14, { align: 'center' });
  doc.setFontSize(9);
  doc.text("Original", startX + width - 5, boxY + 12, { align: 'right' });
  drawLine(startX, boxY + 18, startX + width, boxY + 18);

  // Metadata Section
  let rowY = boxY + 18;
  
  doc.setFontSize(8);
  doc.text("Invoice No. :", startX + 5, rowY + 12);
  doc.setFont("helvetica", "normal");
  doc.text(ticket.rma || "N/A", startX + 70, rowY + 12);
  
  doc.setFont("helvetica", "bold");
  doc.text("P O No", startX + 220, rowY + 12);
  doc.text(":", startX + 260, rowY + 12);
  
  doc.text("Challan No", startX + 380, rowY + 12);
  doc.text(":", startX + 440, rowY + 12);
  
  drawLine(startX, rowY + 18, startX + width, rowY + 18);
  rowY += 18;

  doc.setFont("helvetica", "bold");
  doc.text("Date", startX + 5, rowY + 12);
  doc.text(":", startX + 60, rowY + 12);
  doc.setFont("helvetica", "normal");
  doc.text(ticket.date || "N/A", startX + 70, rowY + 12);
  
  doc.setFont("helvetica", "bold");
  doc.text("P O Date", startX + 220, rowY + 12);
  doc.text(":", startX + 260, rowY + 12);
  
  doc.text("Challan Date :", startX + 380, rowY + 12);
  
  drawLine(startX, rowY + 18, startX + width, rowY + 18);
  rowY += 18;

  doc.text("Driver Name :", startX + 5, rowY + 12);
  doc.text("Vehicle No :", startX + 220, rowY + 12);
  doc.text("E-Way Bill :", startX + 380, rowY + 12);

  drawLine(startX, rowY + 18, startX + width, rowY + 18);
  rowY += 18;

  // Address section split
  const addressHeight = 85;
  drawLine(startX + width / 2, rowY, startX + width / 2, rowY + addressHeight);
  
  const customerName = ticket.customerName || ticket.name || 'Customer';
  const customerPhone = ticket.contactNumber || '';

  // Billed To
  doc.text("Billed To :", startX + 5, rowY + 12);
  doc.text(customerName, startX + 5, rowY + 27);
  doc.setFont("helvetica", "normal");
  doc.text("Address details unavailable for RMA", startX + 5, rowY + 42);
  
  doc.setFont("helvetica", "bold");
  doc.text("Place of Supply :", startX + 5, rowY + 67);
  doc.text("GSTIN No. :", startX + 5, rowY + 79);
  doc.text("Mo. : " + customerPhone, startX + 130, rowY + 79);

  // Shipped To
  const rightX = startX + width / 2 + 5;
  doc.text("Shipped To :", rightX, rowY + 12);
  doc.text(customerName, rightX, rowY + 27);
  doc.setFont("helvetica", "normal");
  doc.text("Address details unavailable for RMA", rightX, rowY + 42);
  
  doc.setFont("helvetica", "bold");
  doc.text("Place of Supply :", rightX, rowY + 67);
  doc.text("GSTIN No. :", rightX, rowY + 79);
  doc.text("Mo. : " + customerPhone, rightX + 130, rowY + 79);

  rowY += addressHeight;
  drawLine(startX, rowY, startX + width, rowY);

  // Items Table Header
  const colX = [startX, startX + 30, startX + 260, startX + 320, startX + 350, startX + 380, startX + 430, startX + 470, startX + width];
  
  const drawColLines = (y1, y2) => {
    for (let i = 1; i < colX.length - 1; i++) {
      drawLine(colX[i], y1, colX[i], y2);
    }
  };

  doc.setFontSize(9);
  
  const centerText = (text, x, width, y) => {
    doc.text(text, x + width / 2, y, { align: 'center' });
  };

  centerText("Sr No", colX[0], 30, rowY + 12);
  centerText("Product Name", colX[1], 230, rowY + 12);
  centerText("HSN / SAC", colX[2], 60, rowY + 12);
  centerText("Qty", colX[3], 30, rowY + 12);
  centerText("Unit", colX[4], 30, rowY + 12);
  centerText("Rate", colX[5], 50, rowY + 12);
  centerText("GST %", colX[6], 40, rowY + 12);
  centerText("Amount", colX[7], 65, rowY + 12);

  drawLine(startX, rowY + 20, startX + width, rowY + 20);
  
  // Items data
  const itemsStartY = rowY + 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  
  centerText("1", colX[0], 30, itemsStartY + 12);
  
  let productDesc = `${ticket.product || 'Product'}`;
  if (ticket.category) productDesc += `\nCategory: ${ticket.category}`;
  if (ticket.serialNumber) productDesc += `\nSr No: ${ticket.serialNumber}`;
  if (ticket.status) productDesc += `\nStatus: ${ticket.status}`;
  productDesc += `\nStage: ${stageName}`;
  
  const splitDesc = doc.splitTextToSize(productDesc, 220);
  doc.text(splitDesc, colX[1] + 5, itemsStartY + 12);
  
  centerText("1.00", colX[3], 30, itemsStartY + 12);
  centerText("NOS", colX[4], 30, itemsStartY + 12);
  centerText("0.00", colX[5], 50, itemsStartY + 12);
  centerText("0.00", colX[6], 40, itemsStartY + 12);
  centerText("0.00", colX[7], 65, itemsStartY + 12);

  // Draw vertical lines
  const footerY = boxY + 550; 
  drawColLines(rowY, footerY);
  drawLine(startX, footerY, startX + width, footerY);

  // Footer
  doc.setFont("helvetica", "bold");
  doc.text("GSTIN No :    24DUSPP8599C1ZS", startX + 5, footerY + 12);
  doc.text("Sub Total", colX[6] + 5, footerY + 12);
  doc.text("0.00", startX + width - 5, footerY + 12, { align: 'right' });
  drawLine(startX, footerY + 20, startX + width, footerY + 20);

  // Bank Details & Taxes
  const bankY = footerY + 20;
  doc.text("Bank Name", startX + 5, bankY + 12);
  doc.text(":", startX + 80, bankY + 12);
  doc.setFont("helvetica", "normal");
  doc.text("SBI BANK, Bakrol Branch", startX + 90, bankY + 12);
  
  doc.setFont("helvetica", "bold");
  doc.text("Bank A/c. No.", startX + 5, bankY + 24);
  doc.text(":", startX + 80, bankY + 24);
  doc.setFont("helvetica", "normal");
  doc.text("44516176686", startX + 90, bankY + 24);
  
  doc.setFont("helvetica", "bold");
  doc.text("RTGS/IFSC Code", startX + 5, bankY + 36);
  doc.text(":", startX + 80, bankY + 36);
  doc.setFont("helvetica", "normal");
  doc.text("SBIN0061574", startX + 90, bankY + 36);

  // Tax split lines
  const taxLineX = startX + 380;
  drawLine(taxLineX, bankY, taxLineX, bankY + 50);
  
  doc.setFont("helvetica", "bold");
  doc.text("Taxable Amount", taxLineX + 5, bankY + 24);
  doc.text("0.00", taxLineX + 150, bankY + 24, { align: 'right' });
  
  doc.setFont("helvetica", "normal");
  doc.text("Central Tax", taxLineX + 5, bankY + 36);
  doc.text("0.00", taxLineX + 150, bankY + 36, { align: 'right' });
  
  doc.text("State/UT Tax", taxLineX + 5, bankY + 48);
  doc.text("0.00", taxLineX + 150, bankY + 48, { align: 'right' });

  drawLine(startX, bankY + 50, startX + width, bankY + 50);

  // Total GST and Bill Amount
  const totalY = bankY + 50;
  doc.setFont("helvetica", "bold");
  doc.text("Total GST :", startX + 5, totalY + 12);
  doc.setFont("helvetica", "normal");
  doc.text("Zero Only", startX + 60, totalY + 12);
  
  doc.setFont("helvetica", "bold");
  doc.text("Bill Amount :", startX + 5, totalY + 24);
  doc.setFont("helvetica", "normal");
  doc.text("Zero Only", startX + 70, totalY + 24);

  // Grand Total Box
  drawLine(taxLineX, bankY + 50, taxLineX, bankY + 80);
  doc.setFillColor(226, 232, 240);
  doc.rect(taxLineX, bankY + 50, width - 380, 30, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Grand Total", taxLineX + 5, bankY + 68);
  doc.text("0.00", startX + width - 5, bankY + 68, { align: 'right' });

  drawLine(startX, bankY + 80, startX + width, bankY + 80);

  // T&C and Signature
  const tcY = bankY + 80;
  doc.setFontSize(8);
  doc.text("Terms & Conditions :", startX + 5, tcY + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("1. Goods once sold will not be taken back.", startX + 5, tcY + 24);
  doc.text("2. Interest @18% p.a. will be charged if payment is not made within due date.", startX + 5, tcY + 34);
  doc.text("3. Our risk and responsibility ceases as soon as the goods leave our premises.", startX + 5, tcY + 44);
  doc.text("4. \"Subject to 'Anand' Jurisdiction only. E.&.O.E\"", startX + 5, tcY + 54);

  // Signature
  const sigX = startX + 380;
  drawLine(sigX, tcY, sigX, boxY + 700);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("For, AVXPERTS", startX + width - 5, tcY + 12, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("(Authorised Signatory)", startX + width - 5, tcY + 62, { align: 'right' });

  window.open(doc.output('bloburl'), '_blank');
  doc.save(`${ticket.rma}_${stageName.replace(/ /g, '_')}.pdf`);
};
