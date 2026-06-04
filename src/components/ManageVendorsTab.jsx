import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Building2, MapPin, FileText, Phone, Mail, Pencil, Trash2 } from 'lucide-react';

export default function ManageVendorsTab({ vendors, setVendors, userRole, fetchBackendData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullVendors, setFullVendors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    gstNumber: '',
    phoneNumber: '',
    email: ''
  });

  const loadVendors = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const res = await axios.get(`${baseUrl}/vendors`);
      setFullVendors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.companyName.trim()) {
      alert("Company Name is required");
      return;
    }
    
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      if (editingId) {
        await axios.put(`${baseUrl}/vendors/${editingId}`, formData);
      } else {
        await axios.post(`${baseUrl}/vendors`, formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ companyName: '', address: '', gstNumber: '', phoneNumber: '', email: '' });
      loadVendors();
      fetchBackendData();
    } catch (err) {
      alert(`Failed to ${editingId ? 'update' : 'add'} vendor. Note: Only Admins can modify vendors.`);
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        await axios.delete(`${baseUrl}/vendors/${id}`);
        loadVendors();
        fetchBackendData();
      } catch (err) {
        if (err.response && err.response.data && err.response.data.error) {
          alert(err.response.data.error);
        } else {
          alert("Failed to delete vendor.");
        }
      }
    }
  };

  const openEditModal = (vendor) => {
    setEditingId(vendor.id);
    setFormData({
      companyName: vendor.companyName || '',
      address: vendor.address || '',
      gstNumber: vendor.gstNumber || '',
      phoneNumber: vendor.phoneNumber || '',
      email: vendor.email || ''
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ companyName: '', address: '', gstNumber: '', phoneNumber: '', email: '' });
    setIsModalOpen(true);
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
            onClick={openAddModal}
            style={{ padding: '10px 24px', height: 'auto' }}
          >
            Add Vendor
          </button>
        </div>

        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {fullVendors.map((ven) => (
            <div key={ven.id} style={{ padding: '20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', position: 'relative' }}>
              
              {userRole === 'ADMIN' && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                  <button onClick={() => openEditModal(ven)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(ven.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingRight: '40px' }}>
                <Building2 size={18} color="#3b82f6" />
                <span style={{ fontSize: '16px', color: '#0f172a', fontWeight: '600' }}>{ven.companyName}</span>
              </div>
              
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
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h2 className="modal-title">{editingId ? 'Edit Service Vendor' : 'Add Service Vendor'}</h2>
                <p className="modal-subtitle">{editingId ? 'Update vendor details below.' : 'Enter vendor details below.'}</p>
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
              <button className="btn-save" onClick={handleSave}>{editingId ? 'Save Changes' : 'Add Vendor'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
