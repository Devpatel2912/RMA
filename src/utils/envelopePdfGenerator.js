import jsPDF from 'jspdf';

export const generateEnvelopePDF = (toEnvelope, fromProfile) => {
  // Standard DL Envelope: 220 x 110 mm, landscape
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'dl' });
  
  // Set default font
  doc.setFont('helvetica');

  const startY = 20;

  // 1. "From" Section (Left)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('FROM:', 15, startY);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  let currentY = startY + 6;
  
  if (fromProfile?.address) {
    const fromLines = doc.splitTextToSize(fromProfile.address, 90);
    doc.text(fromLines, 15, currentY);
    currentY += fromLines.length * 4.5;
  }
  
  if (fromProfile?.pincode) {
    doc.text(`PIN: ${fromProfile.pincode}`, 15, currentY);
    currentY += 4.5;
  }
  if (fromProfile?.phoneNumber) {
    doc.text(`Mo: ${fromProfile.phoneNumber}`, 15, currentY);
    currentY += 4.5;
  }
  if (fromProfile?.email) {
    doc.text(`Email: ${fromProfile.email}`, 15, currentY);
    currentY += 4.5;
  }
  if (fromProfile?.website) {
    doc.text(`Web: ${fromProfile.website}`, 15, currentY);
  }

  // 2. "To" Section (Right)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const toStartX = 115;
  let toStartY = startY;
  doc.text('TO:', toStartX, toStartY);
  
  toStartY += 7;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  if (toEnvelope?.address) {
    const toLines = doc.splitTextToSize(toEnvelope.address, 90);
    doc.text(toLines, toStartX, toStartY);
    toStartY += toLines.length * 5.5;
  }
  
  if (toEnvelope?.pincode) {
    doc.setFont('helvetica', 'bold');
    doc.text(`PIN: ${toEnvelope.pincode}`, toStartX, toStartY);
    doc.setFont('helvetica', 'normal');
    toStartY += 5.5;
  }
  if (toEnvelope?.phoneNumber) {
    doc.text(`Mo: ${toEnvelope.phoneNumber}`, toStartX, toStartY);
  }

  // Open the PDF in a new tab
  window.open(doc.output('bloburl'), '_blank');
};
