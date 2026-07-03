import React, { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import CameraCapture from './CameraCapture';
import { generateTicketPDF } from '../utils/pdfGenerator';

export default function AdvanceWorkflowModal({
  advancingItem, setAdvancingItem,
  shippingImagePreview, setShippingImagePreview,
  advanceDate, setAdvanceDate,
  newSerialNumber, setNewSerialNumber,
  courierCharge, setCourierCharge,
  customMessage, setCustomMessage,
  confirmAdvanceStatus
}) {
  const [isDocketCameraOpen, setIsDocketCameraOpen] = useState(false);
  const [isProductCameraOpen, setIsProductCameraOpen] = useState(false);

  if (!advancingItem) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content advance-modal" onClick={e => e.stopPropagation()}>
        <div className="advance-modal-header">
          <div className="print-only" style={{ marginBottom: '24px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: '#0f172a' }}>RMA Flow</h1>
            <p style={{ fontSize: '14px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>Vendor Return Ticket</p>
          </div>
          <h2 className="modal-title no-print">Advance Workflow</h2>
          <p className="modal-subtitle no-print">Moving <span style={{ fontWeight: 700, color: '#0f172a' }}>{advancingItem.rma}</span> to the next stage.</p>
          <div className="print-only" style={{ marginTop: '16px', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>TICKET #: {advancingItem.rma}</span>
          </div>
        </div>

        <div className="advance-modal-body">
          <div className="current-state-box">
            <span className="current-state-label">CURRENT STATE</span>
            <span className="current-state-value">{advancingItem.status}</span>
          </div>
          {advancingItem.status === 'VENDOR OUTWARD' ? (
            <div style={{ marginTop: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Product Details</span>
                <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500, display: 'block', marginBottom: '8px' }}>{advancingItem.product}</span>
                <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="detail-item">
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Customer Name</span>
                    <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>{advancingItem.name}</span>
                  </div>
                  <div className="detail-item">
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Category</span>
                    <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>{advancingItem.category}</span>
                  </div>
                  <div className="detail-item">
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Service Vendor</span>
                    <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>{advancingItem.serviceVendor}</span>
                  </div>
                  <div className="detail-item">
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Serial Number</span>
                    <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>{advancingItem.serialNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Date</span>
                    <input type="date" className="form-input" style={{ padding: '6px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '4px' }} value={advanceDate} onChange={(e) => setAdvanceDate(e.target.value)} />
                  </div>
                </div>
              </div>

              {advancingItem.inwardImageURL && (
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Inward Image</span>
                  <img src={advancingItem.inwardImageURL} alt="Inward" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Upload Docket Number</label>
                {isDocketCameraOpen ? (
                  <CameraCapture 
                    onCapture={(file) => {
                      const reader = new FileReader();
                      reader.onload = (event) => setShippingImagePreview(event.target.result);
                      reader.readAsDataURL(file);
                      setIsDocketCameraOpen(false);
                    }}
                    onCancel={() => setIsDocketCameraOpen(false)}
                  />
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => setIsDocketCameraOpen(true)} style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#f8fafc', fontSize: '14px', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Camera size={16} /> Camera
                    </button>
                    <label style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#f8fafc', fontSize: '14px', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Upload size={16} /> Upload
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => setShippingImagePreview(event.target.result);
                            reader.readAsDataURL(file);
                          } else {
                            setShippingImagePreview(null);
                          }
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              {shippingImagePreview && !isDocketCameraOpen && (
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Shipping Image Preview</span>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={shippingImagePreview} alt="Shipping Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <button 
                      type="button"
                      onClick={() => setShippingImagePreview(null)}
                      style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => generateTicketPDF(advancingItem.status, advancingItem)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}
              >
                Print Ticket
              </button>
            </div>
          ) : advancingItem.status === 'VENDOR INWARD' ? (
            <div style={{ marginTop: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Product Name</span>
                <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500, display: 'block' }}>{advancingItem.product}</span>
              </div>

              <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div className="detail-item">
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Customer Name</span>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>{advancingItem.name}</span>
                </div>
                <div className="detail-item">
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Category</span>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>{advancingItem.category}</span>
                </div>
                <div className="detail-item">
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Old Serial Number</span>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>{advancingItem.serialNumber}</span>
                </div>
                <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>New Serial Number</label>
                  <input type="text" className="form-input" style={{ padding: '8px', fontSize: '14px', width: '100%', border: '1px solid #e2e8f0', borderRadius: '4px' }} placeholder="Enter replacement serial number..." value={newSerialNumber} onChange={(e) => setNewSerialNumber(e.target.value)} />
                </div>
                <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Courier Charge</label>
                  <input type="text" className="form-input" style={{ padding: '8px', fontSize: '14px', width: '100%', border: '1px solid #e2e8f0', borderRadius: '4px' }} placeholder="e.g. $15.00" value={courierCharge} onChange={(e) => setCourierCharge(e.target.value)} />
                </div>
                <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Transition Date</label>
                  <input type="date" className="form-input" style={{ padding: '8px', fontSize: '14px', width: '100%', border: '1px solid #e2e8f0', borderRadius: '4px' }} value={advanceDate} onChange={(e) => setAdvanceDate(e.target.value)} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Upload Product Image</label>
                {isProductCameraOpen ? (
                  <CameraCapture 
                    onCapture={(file) => {
                      const reader = new FileReader();
                      reader.onload = (event) => setShippingImagePreview(event.target.result);
                      reader.readAsDataURL(file);
                      setIsProductCameraOpen(false);
                    }}
                    onCancel={() => setIsProductCameraOpen(false)}
                  />
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => setIsProductCameraOpen(true)} style={{ flex: 1, padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#f8fafc', fontSize: '14px', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Camera size={16} /> Camera
                    </button>
                    <label style={{ flex: 1, padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#f8fafc', fontSize: '14px', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Upload size={16} /> Upload
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => setShippingImagePreview(event.target.result);
                            reader.readAsDataURL(file);
                          } else {
                            setShippingImagePreview(null);
                          }
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              {shippingImagePreview && !isProductCameraOpen && (
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Image Preview</span>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={shippingImagePreview} alt="Product Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <button 
                      type="button"
                      onClick={() => setShippingImagePreview(null)}
                      style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => generateTicketPDF(advancingItem.status, advancingItem)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}
              >
                Print Ticket
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '16px' }}>
              <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="detail-item">
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Customer Name</span>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>{advancingItem.name}</span>
                </div>
                <div className="detail-item">
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Category</span>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>{advancingItem.category}</span>
                </div>
                <div className="detail-item">
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Service Vendor</span>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>{advancingItem.serviceVendor}</span>
                </div>
                <div className="detail-item">
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Serial Number</span>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>{advancingItem.serialNumber}</span>
                </div>
                <div className="detail-item">
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Email</span>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500 }}>{advancingItem.email || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Transition Date</span>
                  <input type="date" className="form-input" style={{ padding: '6px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '4px' }} value={advanceDate} onChange={(e) => setAdvanceDate(e.target.value)} />
                </div>
                <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Message to Customer (Optional)</label>
                  <textarea className="form-textarea" style={{ padding: '8px', fontSize: '14px', width: '100%', border: '1px solid #e2e8f0', borderRadius: '4px' }} placeholder="Type a message to send along with the PDF via WhatsApp..." value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} rows="3"></textarea>
                </div>
              </div>
              <button
                type="button"
                onClick={() => generateTicketPDF(advancingItem.status, advancingItem)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: 600, cursor: 'pointer', marginTop: '16px' }}
              >
                Print Ticket
              </button>
            </div>
          )}
        </div>

        <div className="advance-modal-footer">
          <button className="btn-text-cancel" onClick={() => { setAdvancingItem(null); setShippingImagePreview(null); }}>Cancel</button>
          <button className="btn-confirm" onClick={confirmAdvanceStatus}>Confirm Transition</button>
        </div>
      </div>
    </div>
  );
}
