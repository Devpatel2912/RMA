import React, { useState } from 'react';
import { X, Building2, MapPin, FileText, Phone, Mail } from 'lucide-react';

export default function ManageVendorsTab({ vendors, setVendors }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    gstNumber: '',
    phoneNumber: '',
    email: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.companyName.trim()) {
      alert("Company Name is required");
      return;
    }
    setVendors(prev => [...prev, { ...formData }]);
    setIsModalOpen(false);
    setFormData({ companyName: '', address: '', gstNumber: '', phoneNumber: '', email: '' });
  };

  return (
    <>
      <div className="header">
        <div className="header-text">
          <h1 className="page-title">Manage Service Vendors</h1>
          <p className="page-subtitle">Add and view service vendor contacts.</p>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
          <button 
            className="btn-save" 
            onClick={() => setIsModalOpen(true)}
            style={{ padding: '10px 24px', height: 'auto' }}
          >
            Add Vendor
          </button>
        </div>

        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {vendors.map((ven, idx) => {
            const isObject = typeof ven === 'object';
            const name = isObject ? ven.companyName : ven;
            return (
              <div key={idx} style={{ padding: '20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Building2 size={18} color="#3b82f6" />
                  <span style={{ fontSize: '16px', color: '#0f172a', fontWeight: '600' }}>{name}</span>
                </div>
                
                {isObject && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    {ven.address && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <MapPin size={14} color="#64748b" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: '#475569' }}>{ven.address}</span>
                      </div>
                    )}
                    {ven.gstNumber && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={14} color="#64748b" />
                        <span style={{ fontSize: '13px', color: '#475569' }}>GST: {ven.gstNumber}</span>
                      </div>
                    )}
                    {ven.phoneNumber && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone size={14} color="#64748b" />
                        <span style={{ fontSize: '13px', color: '#475569' }}>{ven.phoneNumber}</span>
                      </div>
                    )}
                    {ven.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mail size={14} color="#64748b" />
                        <span style={{ fontSize: '13px', color: '#475569' }}>{ven.email}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h2 className="modal-title">Add Service Vendor</h2>
                <p className="modal-subtitle">Enter vendor details below.</p>
              </div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Company Name *</label>
                <input type="text" className="form-input" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="e.g. ASUS Service Center" />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Address</label>
                <textarea className="form-textarea" name="address" value={formData.address} onChange={handleInputChange} placeholder="Full address..." rows="2"></textarea>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">GST Number</label>
                <input type="text" className="form-input" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} placeholder="GSTIN..." />
              </div>
              <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Phone Number</label>
                  <input type="text" className="form-input" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="+1 234 567 890" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" name="email" value={formData.email} onChange={handleInputChange} placeholder="vendor@example.com" />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSave}>Add Vendor</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
