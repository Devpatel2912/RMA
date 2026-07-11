import React, { useState } from 'react';
import axios from 'axios';
import { X, Building2, MapPin, FileText, Phone, Mail, Pencil, Trash2, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useVendors } from '../api/hooks';
import Spinner, { SkeletonLoader } from './Spinner';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';

const VENDOR_COLORS = [
  '#10b981', '#22C55E', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#EF4444', '#10B981',
];

export default function ManageVendorsTab({ userRole }) {
  const queryClient = useQueryClient();
  const { data: fullVendors = [], isLoading } = useVendors();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '', address: '', gstNumber: '', phoneNumber: '', email: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.companyName.trim()) { alert('Company Name is required'); return; }
    setIsSaving(true);
    try {
      if (editingId) {
        await axios.put(`${baseUrl}/vendors/${editingId}`, formData);
      } else {
        await axios.post(`${baseUrl}/vendors`, formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ companyName: '', address: '', gstNumber: '', phoneNumber: '', email: '' });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    } catch (err) {
      alert(`Failed to ${editingId ? 'update' : 'add'} vendor. Note: Only Admins can modify vendors.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;
    setDeletingId(id);
    try {
      await axios.delete(`${baseUrl}/vendors/${id}`);
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to delete vendor.');
    } finally {
      setDeletingId(null);
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

  return (
    <>
      {/* ── Page Header ── */}
      <div className="header" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'none',
          }}>
            <Building2 size={20} color="#fff" />
          </div>
          <div>
            <h1 className="page-title" style={{ fontSize: 22 }}>Service Vendors</h1>
            <p className="page-subtitle">Add and manage service vendor contacts</p>
          </div>
        </div>

        {userRole === 'ADMIN' && (
          <button
            className="btn-save"
            onClick={() => {
              setEditingId(null);
              setFormData({ companyName: '', address: '', gstNumber: '', phoneNumber: '', email: '' });
              setIsModalOpen(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', flex: 'unset', width: 'auto' }}
          >
            <Plus size={16} /> Add Vendor
          </button>
        )}
      </div>

      {/* ── Vendor Grid ── */}
      {isLoading ? (
        <SkeletonLoader rows={6} />
      ) : fullVendors.length === 0 ? (
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', padding: '48px 24px',
          textAlign: 'center', color: 'var(--text-muted)', boxShadow: 'none',
        }}>
          <Building2 size={32} style={{ marginBottom: 12, opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, margin: 0 }}>No vendors yet. Add your first vendor above.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {fullVendors.map((ven, idx) => {
            const accentColor = VENDOR_COLORS[idx % VENDOR_COLORS.length];
            return (
              <div
                key={ven.id}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 24px',
                  position: 'relative',
                  boxShadow: 'none',
                  transition: 'all 0.2s',
                  borderLeft: `4px solid ${accentColor}`,
                  overflow: 'hidden',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* Action Buttons */}
                {userRole === 'ADMIN' && (
                  <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => openEditModal(ven)}
                      title="Edit"
                      style={{
                        width: 30, height: 30, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', background: 'var(--surface-hover)',
                        border: '1px solid var(--border)', borderRadius: 7,
                        cursor: 'pointer', color: 'var(--text-muted)',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface-hover)'; }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(ven.id)}
                      disabled={deletingId === ven.id}
                      title="Delete"
                      style={{
                        width: 30, height: 30, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', background: 'var(--error-light)',
                        border: '1px solid var(--error-border)', borderRadius: 7,
                        cursor: 'pointer', color: 'var(--error)', transition: 'all 0.15s',
                      }}
                    >
                      {deletingId === ven.id ? <Spinner size="xs" variant="muted" /> : <Trash2 size={13} />}
                    </button>
                  </div>
                )}

                {/* Company Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingRight: 72 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: `${accentColor}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Building2 size={18} color={accentColor} />
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{ven.companyName}</span>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ven.address && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <MapPin size={13} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{ven.address}</span>
                    </div>
                  )}
                  {ven.gstNumber && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FileText size={13} color="var(--text-muted)" />
                      <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>GST: {ven.gstNumber}</span>
                    </div>
                  )}
                  {ven.phoneNumber && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Phone size={13} color="var(--text-muted)" />
                      <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{ven.phoneNumber}</span>
                    </div>
                  )}
                  {ven.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Mail size={13} color="var(--text-muted)" />
                      <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{ven.email}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h2 className="modal-title">{editingId ? 'Edit Service Vendor' : 'Add Service Vendor'}</h2>
                <p className="modal-subtitle">{editingId ? 'Update vendor details below.' : 'Enter vendor details below.'}</p>
              </div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input type="text" className="form-input" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="e.g. ASUS Service Center" />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea className="form-textarea" name="address" value={formData.address} onChange={handleInputChange} placeholder="Full address..." rows="2" />
              </div>
              <div className="form-group">
                <label className="form-label">GST Number</label>
                <input type="text" className="form-input" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} placeholder="GSTIN..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone (WhatsApp)</label>
                  <div style={{ display: 'flex', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', transition: 'border-color 0.18s' }}
                    onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <span style={{ padding: '10px 12px', background: 'var(--surface-hover)', color: 'var(--text-secondary)', borderRight: '1px solid var(--border)', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center' }}>+91</span>
                    <input
                      type="text" className="form-input" placeholder="9876543210"
                      name="phoneNumber" maxLength="10"
                      value={formData.phoneNumber ? formData.phoneNumber.replace(/^\+91\s*/, '') : ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        handleInputChange({ target: { name: 'phoneNumber', value: val ? `+91 ${val}` : '' } });
                      }}
                      style={{ border: 'none', borderRadius: 0, boxShadow: 'none', padding: '10px 12px' }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" name="email" value={formData.email} onChange={handleInputChange} placeholder="vendor@example.com" />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancel</button>
              <button
                className="btn-save"
                onClick={handleSave}
                disabled={isSaving}
                style={{ opacity: isSaving ? 0.8 : 1 }}
              >
                {isSaving && <Spinner size="xs" variant="white" />}
                {isSaving ? (editingId ? 'Saving…' : 'Adding…') : (editingId ? 'Save Changes' : 'Add Vendor')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
