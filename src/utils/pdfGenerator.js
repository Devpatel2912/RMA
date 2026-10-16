import jsPDF from 'jspdf';
import { logoBase64 } from '../assets/logoBase64';

const getImageEntries = (ticket) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
  const serverUrl = baseUrl.replace(/\/api$/, '');

  const resolveUrl = (urlStr) => {
    if (!urlStr) return '';
    if (urlStr.startsWith('http') || urlStr.startsWith('data:')) return urlStr;
    const normalizedPath = urlStr.replace(/\\/g, '/');
    return `${serverUrl}/${normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath}`;
  };

  const entries = [];
  const processField = (field, labelPrefix) => {
    if (!field) return;
    try {
      const arr = JSON.parse(field);
      if (Array.isArray(arr)) {
        arr.forEach((url, i) => entries.push({ label: `${labelPrefix} ${i + 1}`, url: resolveUrl(url) }));
      } else {
        entries.push({ label: labelPrefix, url: resolveUrl(field) });
      }
    } catch {
      entries.push({ label: labelPrefix, url: resolveUrl(field) });
    }
  };

  processField(ticket.inwardImageURL, 'Inward Image');
  processField(ticket.vendorInwardImageURL, 'Vendor Inward Image');
  processField(ticket.outwardImageURL, 'Outward Image');
  return entries;
};

const loadImageData = async (src) => {
  if (!src) return null;

  const dataUrl = src.startsWith('data:')
    ? src
    : await new Promise((resolve, reject) => {
        fetch(src)
          .then((response) => {
            if (!response.ok) throw new Error(`Image request failed: ${response.status}`);
            return response.blob();
          })
          .then((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
          .catch(reject);
      });

  const dimensions = await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || 1, height: img.naturalHeight || 1 });
    img.onerror = () => resolve({ width: 1, height: 1 });
    img.src = dataUrl;
  });

  return { dataUrl, ...dimensions };
};

export const generateTicketPDF = async (stageName, ticket) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pdfWindow = window.open('', '_blank');
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
  } catch (e) { }

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

  if (stage === 'VENDOR INWARD' || stage === 'VENDOR OUTWARD') {
    font('bold', 12); doc.text('Vendor Details', margin + 5, y);
    y += 15;
    font('bold', 10);
    doc.text('Vendor :', margin + 5, y);
    font('normal', 10); doc.text(ticket.serviceVendor || ticket.vendor || 'N/A', margin + 110, y);
  } else {
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

  font('bold', 10);
  doc.text('Serial No (New) :', margin + cW / 2, y);
  font('normal', 10); doc.text(ticket.newSerialNumber || 'N/A', margin + cW / 2 + 100, y);

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
  y += 20;
  font('bold', 12); doc.text('Shipping Details', margin + 5, y);
  y += 15;
  font('bold', 10);
  doc.text('Docket Number :', margin + 5, y);
  font('normal', 10); doc.text(ticket.docketNumber || 'N/A', margin + 110, y);

  font('bold', 10);
  doc.text('Courier Charge :', margin + cW / 2, y);
  font('normal', 10); doc.text(ticket.courierCharge || 'N/A', margin + cW / 2 + 100, y);

  y += 20;
  ln(margin, y, margin + cW, y);

  // Images
  const images = getImageEntries(ticket);
  y += 20;
  font('bold', 12); doc.text('Reference Images', margin + 5, y);
  y += 15;

  if (images.length > 0) {
    const gap = 10;
    const columns = 3;
    const cellW = (cW - 10 - gap * (columns - 1)) / columns;
    const imageH = 105;
    const rowH = 128;

    for (let i = 0; i < images.length; i++) {
      const col = i % columns;
      if (col === 0 && y + rowH > 770) {
        doc.addPage();
        y = margin + 20;
        font('bold', 12); doc.text('Reference Images', margin + 5, y);
        y += 18;
      }

      const x = margin + 5 + col * (cellW + gap);
      let image = null;
      try {
        image = await loadImageData(images[i].url);
      } catch (error) {
        console.error('Image load error:', error);
      }
      strk([226, 232, 240], 0.5);
      sRect(x, y, cellW, imageH);

      if (image) {
        const scale = Math.min(cellW / image.width, imageH / image.height);
        const drawW = image.width * scale;
        const drawH = image.height * scale;
        const imageType = image.dataUrl.match(/^data:image\/(\w+)/)?.[1]?.toUpperCase() || 'JPEG';
        const format = imageType === 'JPG' ? 'JPEG' : imageType;
        doc.addImage(image.dataUrl, format, x + (cellW - drawW) / 2, y + (imageH - drawH) / 2, drawW, drawH);
      } else {
        font('normal', 9);
        rgb([150, 150, 150]);
        doc.text('Image unavailable', x + 8, y + 54);
        rgb([0, 0, 0]);
      }

      font('normal', 8);
      rgb([71, 85, 105]);
      doc.text(images[i].label, x, y + imageH + 12, { maxWidth: cellW });
      rgb([0, 0, 0]);

      if (col === columns - 1 || i === images.length - 1) y += rowH;
    }
  } else {
    font('normal', 10);
    doc.setTextColor(150, 150, 150);
    doc.text('Image Not Found', margin + 5, y);
    doc.setTextColor(0, 0, 0);
    y += 15;
  }
  
  y += 5;
  ln(margin, y, margin + cW, y);




  doc.autoPrint();
  const pdfUrl = doc.output('bloburl');
  if (pdfWindow) {
    pdfWindow.location.href = pdfUrl;
  } else {
    window.open(pdfUrl, '_blank');
  }
};
