import { useState } from 'react';
import { Printer, Search, CheckCircle2, Package, Truck, UserCheck } from 'lucide-react';
import jsPDF from 'jspdf';

const StageCard = ({ title, icon: Icon, isActive, printHandler, summary }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    opacity: isActive ? 1 : 0.5,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: 'relative',
    overflow: 'hidden'
  }}>
    {!isActive && (
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(248, 250, 252, 0.5)', zIndex: 1 }} />
    )}
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <div style={{ padding: '10px', backgroundColor: isActive ? '#eff6ff' : '#f1f5f9', borderRadius: '8px', color: isActive ? '#3b82f6' : '#94a3b8' }}>
        <Icon size={24} />
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>{title}</h3>
    </div>
    <div style={{ flex: 1, marginBottom: '20px' }}>
      <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>{summary}</p>
    </div>
    <button 
      onClick={isActive ? printHandler : undefined}
      disabled={!isActive}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        padding: '10px',
        backgroundColor: isActive ? '#3b82f6' : '#e2e8f0',
        color: isActive ? 'white' : '#94a3b8',
        border: 'none',
        borderRadius: '6px',
        fontWeight: 600,
        cursor: isActive ? 'pointer' : 'not-allowed',
        transition: 'background-color 0.2s',
        zIndex: 2,
        position: 'relative'
      }}
    >
      <Printer size={16} />
      Print {title}
    </button>
  </div>
);

export default function PrintReportsTab({ recentActivities }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const selectedTicket = recentActivities.find(t => t.id === selectedTicketId);

  // Helper to determine which stages are active
  const getStageStatus = (ticket) => {
    if (!ticket) return {};
    const statuses = ['CUSTOMER INWARD', 'VENDOR OUTWARD', 'VENDOR INWARD', 'CUSTOMER OUTWARD', 'COMPLETED'];
    const currentIndex = statuses.indexOf(ticket.status);
    
    // If it's CUSTOMER OUTWARD, it effectively means it completed the loop (completed is just the final mark)
    // If it's VENDOR INWARD, it has passed Vendor Outward.
    
    return {
      hasCustomerInward: currentIndex >= 0,
      hasVendorOutward: currentIndex >= 1,
      hasVendorInward: currentIndex >= 2,
      hasCustomerOutward: currentIndex >= 3 || ticket.status === 'COMPLETED'
    };
  };

  const stageFlags = getStageStatus(selectedTicket);

  const generatePDF = (stageName, ticket) => {
    const doc = new jsPDF();
    
    // Header background
    doc.setFillColor(15, 23, 42); // #0f172a
    doc.rect(0, 0, 210, 40, 'F');
    
    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("RMA Flow", 20, 22);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`${stageName} TICKET`, 20, 32);

    doc.setFont("helvetica", "bold");
    doc.text(`TICKET #: ${ticket.rma}`, 140, 27);
    
    let yPos = 60;
    
    const drawField = (label, value, x, y) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(label.toUpperCase(), x, y);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42); // slate-900
      const textVal = value ? value.toString() : "N/A";
      const splitVal = doc.splitTextToSize(textVal, 80);
      doc.text(splitVal, x, y + 6);
      return splitVal.length * 6;
    };

    drawField("Customer Name", ticket.name, 20, yPos);
    drawField("Contact Number", ticket.contactNumber, 110, yPos);
    yPos += 20;
    
    drawField("Email Address", ticket.email, 20, yPos);
    drawField("Date", ticket.date, 110, yPos);
    yPos += 20;
    
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(20, yPos, 190, yPos);
    yPos += 15;

    drawField("Product Model", ticket.product, 20, yPos);
    drawField("Category", ticket.category, 110, yPos);
    yPos += 20;

    drawField("Service Vendor", ticket.serviceVendor, 20, yPos);
    
    if (stageName === 'VENDOR INWARD' || stageName === 'CUSTOMER OUTWARD' || stageName === 'FINAL RESOLUTION') {
      drawField("Courier Charge", ticket.courierCharge, 110, yPos);
      yPos += 20;
      doc.line(20, yPos, 190, yPos);
      yPos += 15;
      drawField("Original Serial #", ticket.oldSerialNumber || ticket.serialNumber, 20, yPos);
      drawField("New Replacement Serial #", ticket.serialNumber, 110, yPos);
      yPos += 30;
    } else {
      drawField("Serial Number", ticket.serialNumber, 110, yPos);
      yPos += 30;
    }

    const addImageToDoc = (label, imgData) => {
      try {
        if (yPos > 200) { doc.addPage(); yPos = 20; }
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 116, 139);
        doc.text(label, 20, yPos);
        yPos += 5;
        doc.addImage(imgData, 'JPEG', 20, yPos, 100, 100, undefined, 'FAST');
        yPos += 110;
      } catch(e) {
        console.error("Failed to add image to PDF", e);
      }
    };

    if (stageName === 'CUSTOMER INWARD' && ticket.inwardImageURL) {
      addImageToDoc("CUSTOMER INWARD IMAGE", ticket.inwardImageURL);
    }
    
    if (stageName === 'VENDOR OUTWARD' && ticket.outwardImageURL) {
      addImageToDoc("SHIPPING SLIP IMAGE", ticket.outwardImageURL);
    }

    if (stageName === 'VENDOR INWARD' && ticket.vendorInwardImageURL) {
      addImageToDoc("REPLACEMENT PRODUCT IMAGE", ticket.vendorInwardImageURL);
    }

    if (stageName === 'FINAL RESOLUTION') {
      if (ticket.inwardImageURL) addImageToDoc("CUSTOMER INWARD IMAGE", ticket.inwardImageURL);
      if (ticket.outwardImageURL) addImageToDoc("SHIPPING SLIP IMAGE", ticket.outwardImageURL);
      if (ticket.vendorInwardImageURL) addImageToDoc("REPLACEMENT PRODUCT IMAGE", ticket.vendorInwardImageURL);
    }
    
    window.open(doc.output('bloburl'), '_blank');
    doc.save(`${ticket.rma}_${stageName.replace(' ', '_')}.pdf`);
  };

  const filteredSearch = recentActivities.filter(t => 
    t.rma.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="print-reports-container" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div className="header print-controls">
        <div className="header-text">
          <h1 className="page-title">Ticket-wise Printing</h1>
          <p className="page-subtitle">Select a specific ticket to print its individual stage reports</p>
        </div>
      </div>

      {/* Ticket Selection Area */}
      <div style={{ marginTop: '32px', backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ position: 'relative' }}>
          <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Search Customer or RMA</label>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 16px' }}>
            <Search size={18} color="#64748b" style={{ marginRight: '12px' }} />
            <input 
              type="text" 
              placeholder="e.g. Alex Rivers or RMA-842109" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value === '') setSelectedTicketId(null);
              }}
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '15px' }}
            />
          </div>
          
          {searchQuery && !selectedTicketId && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10 }}>
              {filteredSearch.length > 0 ? (
                filteredSearch.map(t => (
                  <div 
                    key={t.id}
                    onClick={() => {
                      setSelectedTicketId(t.id);
                      setSearchQuery(`${t.rma} - ${t.name}`);
                    }}
                    style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.rma}</div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>{t.name} • {t.product}</div>
                    </div>
                    <div style={{ fontSize: '12px', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontWeight: 500 }}>
                      {t.status}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '16px', color: '#64748b', textAlign: 'center' }}>No tickets found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stage Cards Area */}
      {selectedTicket && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>Available Stage Prints</h2>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Current Status: <strong style={{ color: '#0f172a' }}>{selectedTicket.status}</strong>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <StageCard 
              title="Customer Inward" 
              icon={UserCheck} 
              isActive={stageFlags.hasCustomerInward} 
              summary="Initial receipt of the product from the customer. Includes product condition and customer details."
              printHandler={() => generatePDF('CUSTOMER INWARD', selectedTicket)}
            />
            <StageCard 
              title="Vendor Outward" 
              icon={Truck} 
              isActive={stageFlags.hasVendorOutward} 
              summary="Shipping manifest and courier details for sending the product to the service vendor."
              printHandler={() => generatePDF('VENDOR OUTWARD', selectedTicket)}
            />
            <StageCard 
              title="Vendor Inward" 
              icon={Package} 
              isActive={stageFlags.hasVendorInward} 
              summary="Receipt of repaired/replaced product from the vendor. Includes new serial numbers."
              printHandler={() => generatePDF('VENDOR INWARD', selectedTicket)}
            />
            <StageCard 
              title="Final Resolution" 
              icon={CheckCircle2} 
              isActive={stageFlags.hasCustomerOutward} 
              summary="Comprehensive final report including all tracking history and final resolution."
              printHandler={() => generatePDF('FINAL RESOLUTION', selectedTicket)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
