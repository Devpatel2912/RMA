import React from 'react';

export default function ManageVendorsTab({ vendors, setVendors, newVendorName, setNewVendorName }) {
  return (
    <>
      <div className="header">
        <div className="header-text">
          <h1 className="page-title">Manage Service Vendors</h1>
          <p className="page-subtitle">Add and view service vendor contacts.</p>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Enter new vendor name..."
            value={newVendorName}
            onChange={(e) => setNewVendorName(e.target.value)}
            style={{ flex: 1 }}
          />
          <button 
            className="btn-save" 
            onClick={() => {
              if (newVendorName.trim() && !vendors.includes(newVendorName.trim())) {
                setVendors(prev => [...prev, newVendorName.trim()]);
              }
              setNewVendorName('');
            }}
            style={{ padding: '0 24px', height: 'auto' }}
          >
            Add Vendor
          </button>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {vendors.map((ven, idx) => (
            <div key={idx} style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>
              {ven}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
