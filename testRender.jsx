import React from 'react';
import ReactDOMServer from 'react-dom/server';
import TicketDetailsModal from './src/components/TicketDetailsModal.jsx';

const mockViewingItem = {
  id: '1234',
  rma: 'RMA-595595',
  name: 'Dev Patel',
  contactNumber: '+91 7203858320',
  email: 'dev29123@gmail.com',
  product: 'ewbfhwvf',
  category: 'CPU',
  serviceVendor: 'miracuves',
  serialNumber: 'wdwd',
  status: 'VENDOR INWARD',
  statusClass: 'bg-purple-light',
  date: '21/06/2026'
};

try {
  const html = ReactDOMServer.renderToString(
    <TicketDetailsModal 
      viewingItem={mockViewingItem}
      setViewingItem={() => {}}
      recentActivities={[mockViewingItem]}
      categories={['CPU']}
      vendors={['miracuves']}
      userRole="ADMIN"
      getTodayDate={() => '2026-06-21'}
    />
  );
  console.log("RENDER SUCCESS!");
} catch (e) {
  console.error("RENDER ERROR:", e);
}
