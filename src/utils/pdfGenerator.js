import jsPDF from 'jspdf';

/**
 * Stage-aware fields per stage:
 *
 * CUSTOMER INWARD  → inwardImageURL        | shows description
 * VENDOR OUTWARD   → outwardImageURL       | shows inward image (reference) + docket image
 * VENDOR INWARD    → vendorInwardImageURL  | shows old serial + new serial + courier charge
 * CUSTOMER OUTWARD → outwardImageURL       | shows new serial + courier charge
 * COMPLETED        → all images            | full summary
 */
export const generateTicketPDF = (stageName, ticket) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  const pageW = 595.28;
  const margin = 35;
  const cW = pageW - margin * 2;

  // ─── Color Palette ─────────────────────────────────────────
  const navy   = [13, 42, 79];
  const blue   = [41, 98, 163];
  const lBlue  = [235, 242, 252];
  const white  = [255, 255, 255];
  const dkText = [30, 41, 59];
  const mdText = [71, 85, 105];
  const border = [203, 213, 225];

  // ─── Helpers ───────────────────────────────────────────────
  const rgb   = (c) => doc.setTextColor(c[0], c[1], c[2]);
  const fill  = (c) => doc.setFillColor(c[0], c[1], c[2]);
  const strk  = (c, w = 0.5) => { doc.setDrawColor(c[0], c[1], c[2]); doc.setLineWidth(w); };
  const fRect = (x, y, w, h) => doc.rect(x, y, w, h, 'F');
  const fdRect = (x, y, w, h) => doc.rect(x, y, w, h, 'FD');
  const sRect = (x, y, w, h) => doc.rect(x, y, w, h, 'S');
  const fRound = (x, y, w, h, r) => doc.roundedRect(x, y, w, h, r, r, 'F');
  const fdRound = (x, y, w, h, r) => doc.roundedRect(x, y, w, h, r, r, 'FD');
  const ln    = (x1, y1, x2, y2) => doc.line(x1, y1, x2, y2);
  const circ  = (x, y, r) => doc.ellipse(x, y, r, r, 'F');
  const font  = (style, size) => { doc.setFont('helvetica', style); if (size) doc.setFontSize(size); };

  let y = margin;

  // ═══════════════════════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════════════════════

  // Blue decorative corner (top right)
  fill(navy);
  doc.triangle(pageW - margin, margin, pageW - margin, margin + 90, pageW - margin - 70, margin, 'F');
  fill(blue);
  doc.triangle(pageW - margin, margin + 10, pageW - margin, margin + 78, pageW - margin - 52, margin + 10, 'F');

  // AVXPERTS "A" Triangle Logo
  const lx = margin, ly = y + 4;
  fill(navy); doc.triangle(lx + 26, ly, lx + 2, ly + 42, lx + 50, ly + 42, 'F');
  fill(white); doc.triangle(lx + 26, ly + 11, lx + 10, ly + 38, lx + 42, ly + 38, 'F');
  fill(navy); fRect(lx + 14, ly + 26, 24, 5);

  font('bold', 20); rgb(navy);
  doc.text('AVXPERTS', lx, ly + 58);
  font('normal', 7); rgb(blue);
  doc.text('\u2014  EXPERT CARE. TRUSTED SERVICE.  \u2014', lx, ly + 71);

  // Address info (right)
  const ax = pageW / 2 + 10, ay = y + 6;
  fill(navy); circ(ax + 5, ay + 5, 5);
  font('normal', 8); rgb(dkText);
  doc.text('16, Shiv Shyam Icon,', ax + 16, ay + 8);
  doc.text('Nr. Shree Ram Shadan, Karamsad,', ax + 16, ay + 20);
  doc.text('Anand, Gujarat 388325', ax + 16, ay + 32);
  fill(navy); circ(ax + 5, ay + 46, 5);
  doc.text('+91 7990103273', ax + 16, ay + 49);
  fill(navy); circ(ax + 5, ay + 62, 5);
  doc.text('info@avxperts.co.in', ax + 16, ay + 65);

  y = ly + 83;
  strk(border, 0.4); ln(margin, y, pageW - margin, y);
  y += 12;

  // ═══════════════════════════════════════════════════════════
  // SERVICE RECEIPT BANNER
  // ═══════════════════════════════════════════════════════════
  fill(navy); fRect(margin, y, cW, 32);
  font('bold', 15); rgb(white);
  doc.text('SERVICE RECEIPT', margin + 14, y + 21);
  fill(blue); fRound(margin + cW - 86, y + 6, 78, 20, 3);
  font('bold', 8); rgb(white);
  doc.text('ORIGINAL', margin + cW - 47, y + 19, { align: 'center' });
  y += 32 + 18;

  // ═══════════════════════════════════════════════════════════
  // RMA / DATE / STAGE ROW
  // ═══════════════════════════════════════════════════════════
  fill(navy); circ(margin + 14, y + 12, 12);
  font('bold', 9); rgb(white); doc.text('\u2261', margin + 9, y + 16);

  font('bold', 8.5); rgb(navy);
  doc.text('RMA No.', margin + 32, y + 8);
  doc.text(':', margin + 74, y + 8);
  font('normal', 8.5); rgb(dkText);
  doc.text(ticket.rma || 'N/A', margin + 80, y + 8);

  font('bold', 8.5); rgb(navy);
  doc.text('Date', margin + 32, y + 22);
  doc.text(':', margin + 74, y + 22);
  font('normal', 8.5); rgb(dkText);
  doc.text(ticket.date || 'N/A', margin + 80, y + 22);

  const dvX = pageW / 2 - 15;
  strk(border, 0.5); ln(dvX, y - 2, dvX, y + 34);

  font('bold', 8.5); rgb(navy);
  doc.text('Stage', dvX + 15, y + 8);

  const stage = (stageName || ticket.status || '').toUpperCase();
  const sc = {
    'CUSTOMER INWARD':  { bg: [219,234,254], bd: [147,197,253], tx: [30,64,175] },
    'VENDOR OUTWARD':   { bg: [254,243,199], bd: [253,224,71],  tx: [146,64,14] },
    'VENDOR INWARD':    { bg: [237,233,254], bd: [196,181,253], tx: [109,40,217] },
    'CUSTOMER OUTWARD': { bg: [209,250,229], bd: [110,231,183], tx: [6,95,70] },
    'COMPLETED':        { bg: [209,250,229], bd: [110,231,183], tx: [6,95,70] },
  }[stage] || { bg: [241,245,249], bd: border, tx: mdText };

  fill(sc.bg); strk(sc.bd, 0.6);
  doc.roundedRect(dvX + 60, y, 120, 18, 4, 4, 'FD');
  font('bold', 7.5); rgb(sc.tx);
  doc.text(stage, dvX + 120, y + 12, { align: 'center' });

  y += 40;
  strk(border, 0.3); ln(margin, y, pageW - margin, y);
  y += 14;

  // ═══════════════════════════════════════════════════════════
  // CUSTOMER DETAILS
  // ═══════════════════════════════════════════════════════════
  fill(navy); circ(margin + 10, y + 8, 9);
  font('bold', 8); rgb(white); doc.text('\u25A0', margin + 6, y + 11);
  font('bold', 11); rgb(navy);
  doc.text('CUSTOMER DETAILS', margin + 24, y + 12);
  y += 22;

  const custH = 32;
  fill(white); strk(border, 0.5);
  doc.roundedRect(margin, y, cW, custH, 4, 4, 'FD');

  const custName = ticket.customerName || ticket.name || 'N/A';
  const c1 = margin + 14, c2 = margin + cW / 3 + 10, c3 = margin + (cW * 2) / 3 + 10;

  font('bold', 8.5); rgb(navy); doc.text('Name:', c1, y + 13);
  font('normal', 8.5); rgb(dkText); doc.text(custName.substring(0, 22), c1 + 34, y + 13);

  strk(border, 0.4); ln(margin + cW / 3 + 2, y + 5, margin + cW / 3 + 2, y + custH - 5);
  font('bold', 8.5); rgb(navy); doc.text('Contact:', c2, y + 13);
  font('normal', 8.5); rgb(dkText); doc.text(ticket.contactNumber || 'N/A', c2 + 42, y + 13);

  strk(border, 0.4); ln(margin + (cW * 2) / 3 + 2, y + 5, margin + (cW * 2) / 3 + 2, y + custH - 5);
  font('bold', 8.5); rgb(navy); doc.text('Email:', c3, y + 13);
  const em = ticket.email || 'N/A';
  font('normal', 8.5); rgb(dkText); doc.text(em.length > 18 ? em.substring(0, 18) + '...' : em, c3 + 32, y + 13);

  y += custH + 16;

  // ═══════════════════════════════════════════════════════════
  // PRODUCT INFORMATION TABLE
  // ═══════════════════════════════════════════════════════════
  fill(navy); circ(margin + 10, y + 8, 9);
  font('bold', 8); rgb(white); doc.text('\u25CF', margin + 7, y + 11);
  font('bold', 11); rgb(navy);
  doc.text('PRODUCT INFORMATION', margin + 24, y + 12);
  y += 22;

  const tX = [margin, margin + 40, margin + 180, margin + 300, margin + 400, margin + cW];
  const tW = [40, 140, 120, 100, cW - 365];
  const tHd = ['Sr.', 'Product Name', 'Category', 'Serial No', 'Vendor'];

  fill(navy); fRect(margin, y, cW, 24);
  font('bold', 8.5); rgb(white);
  tHd.forEach((h, i) => doc.text(h, tX[i] + tW[i] / 2, y + 16, { align: 'center' }));
  y += 24;

  fill(white); strk(border, 0.5); sRect(margin, y, cW, 26);
  for (let i = 1; i < tX.length - 1; i++) { strk(border, 0.4); ln(tX[i], y, tX[i], y + 26); }

  const serialDisplay = stage === 'VENDOR INWARD' || stage === 'CUSTOMER OUTWARD'
    ? (ticket.serialNumber || 'N/A')   // new serial after replacement
    : (ticket.serialNumber || 'N/A');

  const rowD = ['1', ticket.product || 'N/A', ticket.category || 'N/A', serialDisplay, ticket.serviceVendor || 'N/A'];
  font('normal', 8.5); rgb(dkText);
  rowD.forEach((d, i) => {
    const t = doc.splitTextToSize(String(d), tW[i] - 8)[0];
    doc.text(t, tX[i] + tW[i] / 2, y + 17, { align: 'center' });
  });
  y += 26 + 16;

  // ═══════════════════════════════════════════════════════════
  // STAGE-SPECIFIC FIELDS SECTION
  // ═══════════════════════════════════════════════════════════

  // Build extra fields based on stage
  const extraFields = [];
  let imageLabel = null;
  let imageURL = null;
  let image2Label = null;
  let image2URL = null;

  if (stage === 'CUSTOMER INWARD') {
    extraFields.push({ label: 'Problem Description', value: ticket.description || 'N/A', fullWidth: true });
    imageLabel = 'Customer Inward Image';
    imageURL = ticket.inwardImageURL;

  } else if (stage === 'VENDOR OUTWARD') {
    extraFields.push({ label: 'Outward Date', value: ticket.date || 'N/A' });
    extraFields.push({ label: 'Service Vendor', value: ticket.serviceVendor || 'N/A' });
    extraFields.push({ label: 'Problem Description', value: ticket.description || 'N/A', fullWidth: true });
    imageLabel = 'Inward Reference Image';
    imageURL = ticket.inwardImageURL;
    image2Label = 'Docket / Shipping Image';
    image2URL = ticket.outwardImageURL;

  } else if (stage === 'VENDOR INWARD') {
    extraFields.push({ label: 'Old Serial Number', value: ticket.oldSerialNumber || ticket.serialNumber || 'N/A' });
    extraFields.push({ label: 'New Serial Number', value: ticket.serialNumber || 'N/A' });
    extraFields.push({ label: 'Courier Charge', value: ticket.courierCharge || 'N/A' });
    extraFields.push({ label: 'Transition Date', value: ticket.date || 'N/A' });
    imageLabel = 'Replacement Product Image';
    imageURL = ticket.vendorInwardImageURL;

  } else if (stage === 'CUSTOMER OUTWARD') {
    extraFields.push({ label: 'New Serial Number', value: ticket.serialNumber || 'N/A' });
    extraFields.push({ label: 'Courier Charge', value: ticket.courierCharge || 'N/A' });
    extraFields.push({ label: 'Completion Date', value: ticket.date || 'N/A' });
    imageLabel = 'Outward Product Image';
    imageURL = ticket.outwardImageURL || ticket.vendorInwardImageURL;

  } else {
    // COMPLETED / fallback
    extraFields.push({ label: 'Completion Date', value: ticket.date || 'N/A' });
    extraFields.push({ label: 'Courier Charge', value: ticket.courierCharge || 'N/A' });
    imageLabel = 'Inward Image';
    imageURL = ticket.inwardImageURL;
    image2Label = 'Outward Image';
    image2URL = ticket.outwardImageURL || ticket.vendorInwardImageURL;
  }

  // Render extra fields section if any
  if (extraFields.length > 0) {
    fill(navy); circ(margin + 10, y + 8, 9);
    font('bold', 8); rgb(white); doc.text('\u2699', margin + 7, y + 12);
    font('bold', 11); rgb(navy);
    doc.text(stage === 'CUSTOMER INWARD' ? 'PROBLEM DESCRIPTION' : 'ADDITIONAL DETAILS', margin + 24, y + 12);
    y += 22;

    // Single fullWidth field (description)
    const fullW = extraFields.find(f => f.fullWidth);
    const others = extraFields.filter(f => !f.fullWidth);

    if (others.length > 0) {
      const maxCols = 3;
      const fieldH = 34;

      // Split into rows of maxCols
      const rows = [];
      for (let i = 0; i < others.length; i += maxCols) {
        rows.push(others.slice(i, i + maxCols));
      }

      rows.forEach((rowFields) => {
        const colCount = rowFields.length;
        const colW = cW / colCount;

        fill(white); strk(border, 0.5);
        fdRound(margin, y, cW, fieldH, 4);

        rowFields.forEach((f, i) => {
          const fx = margin + i * colW + 10;
          if (i > 0) { strk(border, 0.4); ln(margin + i * colW, y + 5, margin + i * colW, y + fieldH - 5); }
          font('bold', 7.5); rgb(mdText); doc.text(f.label.toUpperCase(), fx, y + 12);
          font('bold', 9.5); rgb(dkText); doc.text(String(f.value).substring(0, 26), fx, y + 27);
        });

        y += fieldH + 6;
      });

      y += 2;
    }

    if (fullW) {
      const descText = fullW.value;
      const descLines = doc.splitTextToSize(descText, cW - 22);
      const descH = Math.max(50, descLines.length * 13 + 22);
      fill(white); strk(border, 0.5);
      doc.roundedRect(margin, y, cW, descH, 4, 4, 'FD');
      font('normal', 8.5); rgb(dkText);
      doc.text(descLines, margin + 10, y + 15);
      y += descH + 8;
    }

    y += 8;
  }

  // ═══════════════════════════════════════════════════════════
  // UPLOADED IMAGE(S) SECTION
  // ═══════════════════════════════════════════════════════════
  const addImageSection = (label, url, startY) => {
    if (!url) return startY;

    fill(navy); circ(margin + 10, startY + 8, 9);
    font('bold', 8); rgb(white); doc.text('\u25B2', margin + 7, startY + 11);
    font('bold', 11); rgb(navy);
    doc.text(label.toUpperCase(), margin + 24, startY + 12);
    startY += 22;

    try {
      const maxW = cW;
      const maxH = 180;
      // Draw border box for image
      fill(white); strk(border, 0.5);
      doc.roundedRect(margin, startY, maxW, maxH, 4, 4, 'FD');
      doc.addImage(url, 'JPEG', margin + 4, startY + 4, maxW - 8, maxH - 8, undefined, 'FAST');
    } catch (e) {
      font('normal', 8); rgb(mdText);
      doc.text('Image could not be rendered.', margin + 10, startY + 20);
    }
    return startY + 185 + 14;
  };

  if (imageURL) y = addImageSection(imageLabel, imageURL, y);
  if (image2URL) y = addImageSection(image2Label, image2URL, y);

  // ═══════════════════════════════════════════════════════════
  // TERMS & CONDITIONS + SIGNATURE
  // ═══════════════════════════════════════════════════════════
  const tcH = 95;
  // If not enough space, add a new page
  if (y + tcH + 80 > 841) {
    doc.addPage();
    y = margin;
  }

  fill(lBlue); strk([200, 220, 245], 0.5);
  fdRound(margin, y, cW, tcH, 6);

  fill(navy); circ(margin + 14, y + 14, 9);
  font('bold', 11); rgb(navy);
  doc.text('TERMS & CONDITIONS', margin + 28, y + 18);

  const tcDivX = margin + cW * 0.58;
  const tcLines = [
    'Goods once sold will not be taken back.',
    'Interest @18% p.a. will be charged if payment is not made within due date.',
    'Our risk & responsibility ceases as goods leave our premises.',
    "Subject to 'Anand' Jurisdiction only. E.&.O.E",
  ];
  tcLines.forEach((l, i) => {
    const lineY = y + 32 + i * 14;
    fill(blue); circ(margin + 13, lineY - 2, 4);
    font('bold', 6); rgb(white); doc.text('\u2713', margin + 10, lineY + 1);
    font('normal', 7.5); rgb(dkText);
    doc.text(doc.splitTextToSize(l, tcDivX - margin - 28)[0], margin + 21, lineY + 1);
  });

  strk([180, 210, 240], 0.5); ln(tcDivX, y + 8, tcDivX, y + tcH - 8);

  const sigW = margin + cW - tcDivX;
  font('bold', 10); rgb(navy);
  doc.text('For, AVXPERTS', tcDivX + sigW / 2, y + 20, { align: 'center' });
  strk(navy, 0.5); ln(tcDivX + 15, y + tcH - 25, margin + cW - 15, y + tcH - 25);
  font('normal', 8); rgb(mdText);
  doc.text('(Authorised Signatory)', tcDivX + sigW / 2, y + tcH - 10, { align: 'center' });
  y += tcH + 14;

  // ═══════════════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════════════
  const ftH = 52;
  fill(navy); fRound(margin, y, cW, ftH, 6);

  fill(blue); circ(margin + 26, y + ftH / 2, 17);
  font('bold', 14); rgb(white); doc.text('\u260E', margin + 18, y + ftH / 2 + 6);

  font('bold', 9); rgb(white); doc.text('Need Help?', margin + 50, y + ftH / 2 - 4);
  font('normal', 7.5); rgb([180, 210, 240]);
  doc.text("We're here to help you.", margin + 50, y + ftH / 2 + 8);
  doc.text('Thank you for choosing ', margin + 50, y + ftH / 2 + 19);
  font('bold', 7.5); rgb(white); doc.text('AVXPERTS.', margin + 131, y + ftH / 2 + 19);

  strk([60, 100, 155], 0.5); ln(pageW / 2 + 20, y + 10, pageW / 2 + 20, y + ftH - 10);

  const socX = pageW / 2 + 36;
  font('bold', 7); rgb([180, 210, 240]); doc.text('FOLLOW US', socX, y + 18);
  ['f', 'in', 'w'].forEach((s, i) => {
    const ix = socX + i * 30, iy = y + 36;
    fill([60, 100, 155]); circ(ix + 10, iy, 10);
    font('bold', 7.5); rgb(white); doc.text(s, ix + 10, iy + 3, { align: 'center' });
  });

  // ─── PRINT ──────────────────────────────────────────────────
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
};
