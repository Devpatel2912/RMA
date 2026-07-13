import jsPDF from 'jspdf';
import { logoBase64 } from '../assets/logoBase64';

export const generateTicketPDF = (stageName, ticket) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageW = 595.28;
  const margin = 20;
  const cW = pageW - margin * 2;
  const yStart = margin;
  let y = margin;
  
  // Helpers
  const rgb = (c) => doc.setTextColor(c[0], c[1], c[2]);
  const fill = (c) => doc.setFillColor(c[0], c[1], c[2]);
  const strk = (c, w = 1) => { doc.setDrawColor(c[0], c[1], c[2]); doc.setLineWidth(w); };
  const fRect = (x, yy, w, h) => doc.rect(x, yy, w, h, 'F');
  const sRect = (x, yy, w, h) => doc.rect(x, yy, w, h, 'S');
  const ln = (x1, y1, x2, y2) => doc.line(x1, y1, x2, y2);
  const font = (style, size) => { doc.setFont('helvetica', style); if (size) doc.setFontSize(size); };
  
  // Black & White theme
  const black = [0, 0, 0];
  const border = [0, 0, 0];
  const textDark = [0, 0, 0];

  const stage = (stageName || ticket.status || '').toUpperCase();
  const isFinalStage = stage === 'CUSTOMER OUTWARD' || stage === 'COMPLETED';

  // --- HEADER SECTION (COMMON) ---
  strk(border, 0.5);
  sRect(margin, y, cW, 800); // Outer box
  
  // Logo Box
  try {
    doc.addImage(logoBase64, 'PNG', margin + 5, y + 2, 60, 60);
  } catch(e) {}
  
  // Company Info
  rgb(textDark); font('bold', 24);
  doc.text('AVXPERTS', margin + 80, y + 25);
  font('normal', 9);
  doc.text('16, Shiv Shyam Icon, Nr. Shree Ram Shadan, Karamsad, Anand, Gujarat 388325, India', margin + 80, y + 40);
  doc.text('Mo. +91 7990103273   |   Email. info@avxperts.co.in', margin + 80, y + 55);
  
  y += 65;
  ln(margin, y, margin + cW, y);
  
  // Title Row
  y += 15;
  font('bold', 12);
  const titleText = isFinalStage ? 'TAX INVOICE' : `${stage} RECEIPT`;
  doc.text(titleText, pageW / 2, y, { align: 'center' });
  
  font('bold', 10);
  doc.text('Original', margin + cW - 5, y, { align: 'right' });
  y += 5;
  ln(margin, y, margin + cW, y);

  if (isFinalStage) {
    // ═══════════════════════════════════════════════════════════
    // FINAL STAGE: FULL TAX INVOICE FORMAT
    // ═══════════════════════════════════════════════════════════

    // Metadata row 1
    y += 15;
    font('bold', 9);
    doc.text('Invoice No.', margin + 5, y); doc.text(':', margin + 65, y);
    font('normal', 9); doc.text(ticket.rma || '', margin + 75, y);
    
    font('bold', 9);
    doc.text('P O No.', margin + 220, y); doc.text(':', margin + 260, y);
    doc.text('Challan No.', margin + 380, y); doc.text(':', margin + 440, y);
    
    y += 5; ln(margin, y, margin + cW, y);
    
    // Metadata row 2
    y += 15;
    font('bold', 9);
    doc.text('Date', margin + 5, y); doc.text(':', margin + 65, y);
    font('normal', 9); doc.text(ticket.date || '', margin + 75, y);
    
    font('bold', 9);
    doc.text('P O Date', margin + 220, y); doc.text(':', margin + 260, y);
    doc.text('Challan Date', margin + 380, y); doc.text(':', margin + 440, y);
    
    y += 5; ln(margin, y, margin + cW, y);
    
    // Metadata row 3
    y += 15;
    font('bold', 9); doc.text('Driver Name :', margin + 5, y);
    doc.text('Vehicle No. :', margin + 220, y);
    doc.text('E-Way Bill :', margin + 380, y);
    y += 5; ln(margin, y, margin + cW, y);
    
    // Addresses (Billed To / Shipped To)
    const addrHeight = 100;
    const midX = margin + cW / 2;
    ln(midX, y, midX, y + addrHeight); // vertical split
    
    const drawAddress = (title, x, data) => {
      let ty = y + 15;
      font('bold', 9); doc.text(title, x + 5, ty);
      ty += 15; font('bold', 9); doc.text(data.name || 'Customer', x + 5, ty);
      ty += 15; font('normal', 9);
      
      const addrLines = doc.splitTextToSize(data.address || '', midX - margin - 10);
      doc.text(addrLines, x + 5, ty);
      
      ty = y + addrHeight - 25;
      font('bold', 9); doc.text('Place Of Supply : 24 - Gujarat', x + 5, ty);
      ty += 15;
      doc.text('GSTIN No. : ', x + 5, ty);
      doc.text(`Mo. : ${data.phone || ''}`, x + 130, ty);
    };
    
    const custData = { name: ticket.name || ticket.customerName, address: ticket.customerAddress || '', phone: ticket.contactNumber };
    drawAddress('Billed To :', margin, custData);
    drawAddress('Shipped To :', midX, custData);
    
    y += addrHeight;
    ln(margin, y, margin + cW, y);
    
    // Items Table Header
    const colW = [40, 200, 70, 40, 40, 50, 40, 75];
    const colX = [margin];
    for (let i = 0; i < colW.length - 1; i++) {
      colX.push(colX[i] + colW[i]);
    }
    
    y += 15;
    font('bold', 9);
    const headers = ['Sr No', 'Product Name', 'HSN / SAC', 'Qty', 'Unit', 'Rate', 'GST %', 'Amount'];
    headers.forEach((h, i) => {
      doc.text(h, colX[i] + colW[i] / 2, y, { align: 'center' });
    });
    y += 5;
    ln(margin, y, margin + cW, y);
    
    // Table Items
    const tableTop = y;
    y += 15;
    
    font('normal', 8);
    doc.text('1', colX[0] + colW[0] / 2, y, { align: 'center' });
    
    let prodLines = [];
    prodLines.push(ticket.product || 'Product');
    if (ticket.category) prodLines.push(`Category : ${ticket.category}`);
    if (ticket.serialNumber) prodLines.push(`Sr No (Old) : ${ticket.serialNumber}`);
    if (ticket.newSerialNumber) prodLines.push(`Sr No (New) : ${ticket.newSerialNumber}`);
    if (ticket.serviceVendor) prodLines.push(`Vendor : ${ticket.serviceVendor}`);
    
    let pY = y;
    prodLines.forEach(l => {
      doc.text(l, colX[1] + 5, pY);
      pY += 12;
    });
    
    const qty = '1.00';
    const unit = 'NOS';
    const rate = ticket.courierCharge || '0.00';
    const amt = ticket.courierCharge || '0.00';
    const gst = '18.00';
    
    doc.text('', colX[2] + colW[2] / 2, y, { align: 'center' }); // HSN
    doc.text(qty, colX[3] + colW[3] / 2, y, { align: 'center' });
    doc.text(unit, colX[4] + colW[4] / 2, y, { align: 'center' });
    doc.text(rate, colX[5] + colW[5]/2, y, { align: 'center' });
    doc.text(gst, colX[6] + colW[6] / 2, y, { align: 'center' });
    doc.text(amt, colX[7] + colW[7] / 2, y, { align: 'center' });
    
    y = pY + 20;
    
    // Draw table vertical lines down to the footer
    const tableBottom = yStart + 560; 
    for (let i = 1; i < colX.length; i++) {
      ln(colX[i], tableTop - 20, colX[i], tableBottom);
    }
    
    y = tableBottom;
    ln(margin, y, margin + cW, y);
    
    // GSTIN & Sub Total
    y += 15;
    font('bold', 9);
    doc.text('GSTIN No. :   24DUSPP8599C1Z5', margin + 5, y);
    doc.text('Sub Total', colX[6] + 5, y);
    doc.text(amt, margin + cW - 5, y, { align: 'right' });
    y += 5; ln(margin, y, margin + cW, y);
    
    // Bank details & Tax breakdown
    const bankTop = y;
    y += 15;
    doc.text('Bank Name', margin + 5, y); doc.text(':', margin + 70, y);
    font('normal', 9); doc.text('SBI BANK, Bakrol Branch', margin + 80, y);
    font('bold', 9);
    
    let taxable = parseFloat(ticket.courierCharge || 0).toFixed(2);
    let tax = ((parseFloat(taxable) * 0.18) / 2).toFixed(2);
    
    doc.text('Taxable Amount', colX[6] + 5, y);
    font('normal', 9); doc.text(taxable, margin + cW - 5, y, { align: 'right' });
    
    y += 15;
    font('bold', 9);
    doc.text('Bank A/c. No.', margin + 5, y); doc.text(':', margin + 70, y);
    font('normal', 9); doc.text('44516176686', margin + 80, y);
    
    doc.text('Central Tax', colX[6] + 5, y);
    doc.text(tax, margin + cW - 5, y, { align: 'right' });
    
    y += 15;
    font('bold', 9);
    doc.text('RTGS/IFSC Code', margin + 5, y); doc.text(':', margin + 70, y);
    font('normal', 9); doc.text('SBIN0061574', margin + 80, y);
    
    doc.text('State/UT Tax', colX[6] + 5, y);
    doc.text(tax, margin + cW - 5, y, { align: 'right' });
    
    y += 10;
    ln(colX[6], bankTop, colX[6], y); // vertical line for tax
    ln(margin, y, margin + cW, y);
    
    // Totals
    y += 15;
    font('bold', 9);
    doc.text('Total GST : ', margin + 5, y);
    doc.text('Bill Amount : ', margin + 5, y + 15);
    
    let total = (parseFloat(taxable) + parseFloat(tax)*2).toFixed(2);
    
    fill([220, 220, 220]); // light gray
    fRect(colX[6], y - 15, colW[6] + colW[7], 30);
    sRect(colX[6], y - 15, colW[6] + colW[7], 30);
    
    doc.text('Grand Total', colX[6] + 5, y + 5);
    doc.text(total, margin + cW - 5, y + 5, { align: 'right' });
    
    y += 15;
    ln(margin, y, margin + cW, y);
    
    // Note / Problem Description
    y += 15;
    doc.text('Note : ', margin + 5, y);
    font('normal', 9);
    const noteLines = doc.splitTextToSize(ticket.description || '', cW - 50);
    doc.text(noteLines, margin + 40, y);
    y += 10 + (noteLines.length * 10);
    ln(margin, y, margin + cW, y);
    
    // Terms & Conditions / Signature
    y += 15;
    font('bold', 9);
    doc.text('Terms & Conditions :', margin + 5, y);
    doc.text('For, AVXPERTS', margin + cW - 5, y, { align: 'right' });
    
    font('normal', 8);
    y += 15; doc.text('1. Goods once sold will not be taken back.', margin + 5, y);
    y += 12; doc.text('2. Interest @18% p.a. will be charged if payment is not made within due date.', margin + 5, y);
    y += 12; doc.text('3. Our risk and responsibility ceases as the goods leave our premises.', margin + 5, y);
    y += 12; doc.text('4. Subject to \'Anand\' Jurisdiction only. E.&.O.E', margin + 5, y);
    
    // Signature squiggle
    y += 15;
    doc.text('(Authorised Signatory)', margin + cW - 5, y, { align: 'right' });
    
  } else if (stage === 'VENDOR OUTWARD') {
    // ═══════════════════════════════════════════════════════════
    // VENDOR OUTWARD: SPECIFIC RECEIPT
    // ═══════════════════════════════════════════════════════════

    y += 15;
    font('bold', 10);
    doc.text('Ticket / RMA No :', margin + 5, y);
    font('normal', 10); doc.text(ticket.rma || 'N/A', margin + 110, y);
    
    font('bold', 10);
    doc.text('Date :', margin + cW - 100, y);
    font('normal', 10); doc.text(ticket.date || 'N/A', margin + cW - 50, y);
    y += 10;
    ln(margin, y, margin + cW, y);

    // Vendor Details
    y += 20;
    font('bold', 12); doc.text('Vendor Details', margin + 5, y);
    y += 15;
    font('bold', 10);
    doc.text('Vendor :', margin + 5, y);
    font('normal', 10); doc.text(ticket.serviceVendor || ticket.vendor || 'N/A', margin + 110, y);
    y += 20;
    ln(margin, y, margin + cW, y);

    // Product Details
    y += 20;
    font('bold', 12); doc.text('Product Information', margin + 5, y);
    y += 15;
    font('bold', 10);
    doc.text('Product Name :', margin + 5, y);
    font('normal', 10); doc.text(ticket.product || 'N/A', margin + 110, y);
    font('bold', 10);
    doc.text('Category :', margin + cW / 2, y);
    font('normal', 10); doc.text(ticket.category || 'N/A', margin + cW / 2 + 80, y);
    y += 20;
    font('bold', 10);
    doc.text('Serial No (Old) :', margin + 5, y);
    font('normal', 10); doc.text(ticket.serialNumber || 'N/A', margin + 110, y);

    if (ticket.newSerialNumber) {
      font('bold', 10);
      doc.text('Serial No (New) :', margin + cW / 2, y);
      font('normal', 10); doc.text(ticket.newSerialNumber, margin + cW / 2 + 100, y);
    }
    y += 30;
    ln(margin, y, margin + cW, y);

    // Problem Description
    y += 20;
    font('bold', 12); doc.text('Problem Description', margin + 5, y);
    y += 15;
    font('normal', 10);
    const descLines = doc.splitTextToSize(ticket.description || 'No description provided.', cW - 10);
    doc.text(descLines, margin + 5, y);

    y += (descLines.length * 15) + 20;
    ln(margin, y, margin + cW, y);

    // Shipping/Docket
    if (ticket.docketNumber) {
      y += 20;
      font('bold', 12); doc.text('Shipping Details', margin + 5, y);
      y += 15;
      font('bold', 10);
      doc.text('Docket Number :', margin + 5, y);
      font('normal', 10); doc.text(ticket.docketNumber, margin + 110, y);
      y += 20;
      ln(margin, y, margin + cW, y);
    }

    // Footer Signature
    const footerY = yStart + 700;
    font('bold', 10);
    doc.text('For, AVXPERTS', margin + cW - 5, footerY, { align: 'right' });
    font('normal', 10);
    doc.text('(Authorised Signatory)', margin + cW - 5, footerY + 40, { align: 'right' });

  } else {
    // ═══════════════════════════════════════════════════════════
    // EARLY STAGE: SIMPLE RECEIPT
    // ═══════════════════════════════════════════════════════════

    y += 15;
    font('bold', 10);
    doc.text('Ticket / RMA No :', margin + 5, y);
    font('normal', 10); doc.text(ticket.rma || 'N/A', margin + 110, y);
    
    font('bold', 10);
    doc.text('Date :', margin + cW - 100, y);
    font('normal', 10); doc.text(ticket.date || 'N/A', margin + cW - 50, y);
    y += 10;
    ln(margin, y, margin + cW, y);

    // Customer / Vendor Details
    y += 20;
    font('bold', 12); doc.text('Contact Details', margin + 5, y);
    y += 15;

    font('bold', 10);
    doc.text('Customer Name :', margin + 5, y);
    font('normal', 10); doc.text(ticket.name || ticket.customerName || 'N/A', margin + 110, y);

    font('bold', 10);
    doc.text('Contact No :', margin + cW / 2, y);
    font('normal', 10); doc.text(ticket.contactNumber || 'N/A', margin + cW / 2 + 80, y);

    y += 20;
    font('bold', 10);
    doc.text('Address :', margin + 5, y);
    font('normal', 10); 
    const addrLines = doc.splitTextToSize(ticket.customerAddress || 'N/A', cW / 2 - 20);
    doc.text(addrLines, margin + 110, y);

    if (stage === 'VENDOR INWARD' || stage === 'VENDOR OUTWARD') {
      font('bold', 10);
      doc.text('Vendor :', margin + cW / 2, y);
      font('normal', 10); doc.text(ticket.serviceVendor || ticket.vendor || 'N/A', margin + cW / 2 + 80, y);
    }

    y += 35;
    ln(margin, y, margin + cW, y);

    // Product Details
    y += 20;
    font('bold', 12); doc.text('Product Information', margin + 5, y);
    y += 15;

    font('bold', 10);
    doc.text('Product Name :', margin + 5, y);
    font('normal', 10); doc.text(ticket.product || 'N/A', margin + 110, y);

    font('bold', 10);
    doc.text('Category :', margin + cW / 2, y);
    font('normal', 10); doc.text(ticket.category || 'N/A', margin + cW / 2 + 80, y);
    
    y += 20;
    font('bold', 10);
    doc.text('Serial No (Old) :', margin + 5, y);
    font('normal', 10); doc.text(ticket.serialNumber || 'N/A', margin + 110, y);

    if (ticket.newSerialNumber) {
      font('bold', 10);
      doc.text('Serial No (New) :', margin + cW / 2, y);
      font('normal', 10); doc.text(ticket.newSerialNumber, margin + cW / 2 + 100, y);
    }

    y += 30;
    ln(margin, y, margin + cW, y);

    // Problem Description
    y += 20;
    font('bold', 12); doc.text('Problem Description', margin + 5, y);
    y += 15;
    font('normal', 10);
    const descLines = doc.splitTextToSize(ticket.description || 'No description provided.', cW - 10);
    doc.text(descLines, margin + 5, y);

    y += (descLines.length * 15) + 20;
    ln(margin, y, margin + cW, y);

    // Footer Signature
    const footerY = yStart + 700;
    font('bold', 10);
    doc.text('For, AVXPERTS', margin + cW - 5, footerY, { align: 'right' });
    font('normal', 10);
    doc.text('(Authorised Signatory)', margin + cW - 5, footerY + 40, { align: 'right' });
  }

  // Add Images on new pages for reports that include image evidence.
  if (stage === 'COMPLETED' || stage === 'VENDOR OUTWARD' || stage === 'VENDOR INWARD') {
    const addImageToDoc = (title, b64) => {
      if (!b64) return;
      doc.addPage();
      doc.setFontSize(14);
      doc.text(title, margin, 40);
      try {
        const format = b64.includes('image/png') ? 'PNG' : 'JPEG';
        doc.addImage(b64, format, margin, 60, cW, 400);
      } catch (e) {
        doc.text("Error loading image.", margin, 60);
      }
    };
    
    const addVendorInwardImages = () => {
      if (!ticket.vendorInwardImageURL) return;

      try {
        const parsed = JSON.parse(ticket.vendorInwardImageURL);
        if (Array.isArray(parsed)) {
          parsed.slice(0, 3).forEach((img, i) => addImageToDoc(`Vendor Inward Product Image ${i + 1}`, img));
        } else {
          addImageToDoc('Vendor Inward Product Image', ticket.vendorInwardImageURL);
        }
      } catch(e) {
        addImageToDoc('Vendor Inward Product Image', ticket.vendorInwardImageURL);
      }
    };

    const addInwardImages = (title) => {
      if (!ticket.inwardImageURL) return;
      try {
        const parsed = JSON.parse(ticket.inwardImageURL);
        if (Array.isArray(parsed)) {
          parsed.slice(0, 3).forEach((img, i) => addImageToDoc(`${title} ${i + 1}`, img));
        } else {
          addImageToDoc(title, ticket.inwardImageURL);
        }
      } catch(e) {
        addImageToDoc(title, ticket.inwardImageURL);
      }
    };

    if (stage === 'VENDOR OUTWARD') {
      addInwardImages('Product Image');
      if (ticket.outwardImageURL) addImageToDoc('Docket Image', ticket.outwardImageURL);
    } else if (stage === 'VENDOR INWARD') {
      addVendorInwardImages();
    } else {
      addInwardImages('Inward Condition');
      addVendorInwardImages();
      if (ticket.outwardImageURL) addImageToDoc('Final Outward Condition', ticket.outwardImageURL);
    }
  }

  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
};
