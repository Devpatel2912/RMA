import React from 'react';
import { X } from 'lucide-react';

export default function TicketDetailsModal({ viewingItem, setViewingItem }) {
  if (!viewingItem) return null;

  return (
    <div className="modal-overlay" onClick={() => setViewingItem(null)}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 className="modal-title">Ticket Details</h2>
            <p className="modal-subtitle">{viewingItem.rma}</p>
          </div>
          <button className="modal-close-btn" onClick={() => setViewingItem(null)}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Customer Name</span>
              <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500, marginTop: '4px' }}>{viewingItem.name}</div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Contact Number</span>
              <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500, marginTop: '4px' }}>{viewingItem.contactNumber}</div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Email</span>
              <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500, marginTop: '4px' }}>{viewingItem.email || 'N/A'}</div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Status</span>
              <div style={{ marginTop: '4px' }}><span className={`status-badge ${viewingItem.statusClass}`}>{viewingItem.status}</span></div>
            </div>
            <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#e2e8f0', margin: '8px 0' }}></div>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Product Name</span>
              <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500, marginTop: '4px' }}>{viewingItem.product}</div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Category</span>
              <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500, marginTop: '4px' }}>{viewingItem.category}</div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Service Vendor</span>
              <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500, marginTop: '4px' }}>{viewingItem.serviceVendor}</div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Current Serial Number</span>
              <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500, marginTop: '4px' }}>{viewingItem.serialNumber}</div>
            </div>
            {viewingItem.oldSerialNumber && (
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Old Serial Number</span>
                <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500, marginTop: '4px' }}>{viewingItem.oldSerialNumber}</div>
              </div>
            )}
            {viewingItem.courierCharge && (
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Courier Charge</span>
                <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500, marginTop: '4px' }}>{viewingItem.courierCharge}</div>
              </div>
            )}
            <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#e2e8f0', margin: '8px 0' }}></div>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Last Updated</span>
              <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500, marginTop: '4px' }}>{viewingItem.date}</div>
            </div>
            {viewingItem.inwardImageURL && (
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Attached Image</span>
                <img src={viewingItem.inwardImageURL} alt="Ticket Image" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={() => setViewingItem(null)}>Close</button>
        </div>
      </div>
    </div>
  );
}
