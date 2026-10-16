import React, { useState } from 'react';
import { Truck, Search, Package, Upload, X, Save, Camera, CheckCircle2 } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import axios from 'axios';

const CourierChargesTab = ({ recentActivities }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTicketId, setExpandedTicketId] = useState(null);

  // State for the expanded form
  const [courierCharge, setCourierCharge] = useState('');
  const [docketNumber, setDocketNumber] = useState('');
  const [docketImages, setDocketImages] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filter tickets based on search term (only RMA, customer name, vendor name)
  const filteredTickets = recentActivities.filter(ticket => {
    const term = searchTerm.toLowerCase();
    return ticket.rma.toLowerCase().includes(term) ||
      (ticket.name?.toLowerCase() || '').includes(term) ||
      (ticket.customerName?.toLowerCase() || '').includes(term) ||
      (ticket.serviceVendor?.toLowerCase() || '').includes(term);
  });

  const ACCENT_COLORS = ['#10b981', '#22C55E', '#8B5CF6', '#F59E0B', '#EC4899'];

  const handleExpand = (ticket) => {
    if (expandedTicketId === ticket.id) {
      setExpandedTicketId(null);
      return;
    }
    setExpandedTicketId(ticket.id);
    setCourierCharge(ticket.courierCharge || '');
    setDocketNumber(ticket.docketNumber || '');

    let existingImages = [];
    if (ticket.outwardImageURL) {
      try {
        existingImages = JSON.parse(ticket.outwardImageURL);
        if (!Array.isArray(existingImages)) existingImages = [ticket.outwardImageURL];
      } catch (e) {
        existingImages = [ticket.outwardImageURL];
      }
    }
    setDocketImages(existingImages);
    setSaveSuccess(false);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setDocketImages(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove) => {
    setDocketImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = async (ticket) => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
      const imagesPayload = docketImages.length > 0 ? JSON.stringify(docketImages) : null;

      await axios.put(`${baseUrl}/tickets/${ticket.id}/status`, {
        status: ticket.status,
        date: ticket.date,
        courierCharge: courierCharge,
        docketNumber: docketNumber,
        outwardImageURL: imagesPayload
      });

      // Update local object optimistically to reflect immediately
      ticket.courierCharge = courierCharge;
      ticket.docketNumber = docketNumber;
      ticket.outwardImageURL = imagesPayload;

      setSaveSuccess(true);
      setTimeout(() => {
        setExpandedTicketId(null);
        setSaveSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Error saving courier details:', err);
      alert('Failed to save details. Check console for error.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div className="header" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'none',
          }}>
            <Truck size={20} color="#fff" />
          </div>
          <div>
            <h1 className="page-title" style={{ fontSize: 22 }}>Courier & Docket Details</h1>
            <p className="page-subtitle">Manage courier charges and docket details for all tickets</p>
          </div>
        </div>
      </div>

      {/* ── Main Card ── */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: 'none',
      }}>

        {/* Search bar */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12, background: 'var(--surface-hover)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>All Tickets</span>
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--primary)',
              background: 'var(--primary-light)', padding: '2px 10px', borderRadius: 99,
            }}>
              {filteredTickets.length}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search Ticket..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  padding: '10px 12px 11px 12px', fontSize: 13,
                  border: '1.5px solid var(--border)', borderRadius: 8,
                  outline: 'none', background: 'var(--surface)',
                  color: 'var(--text-primary)', width: 220,
                  fontFamily: 'Inter, sans-serif', transition: 'border-color 0.18s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>
        </div>

        {/* List body */}
        {filteredTickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
            <Truck size={32} style={{ marginBottom: 12, opacity: 0.2, display: 'block', margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontSize: 14 }}>
              {searchTerm ? 'No tickets match your search.' : 'No tickets available.'}
            </p>
          </div>
        ) : (
          <div>
            {filteredTickets.map((ticket, idx) => {
              const accentColor = ACCENT_COLORS[idx % ACCENT_COLORS.length];
              const isExpanded = expandedTicketId === ticket.id;

              const getFullUrl = (url) => {
                if (!url) return '';
                if (url.startsWith('http') || url.startsWith('data:')) return url;
                const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
                const rootUrl = baseUrl.replace(/\/api$/, '');
                const normalizedPath = url.replace(/\\/g, '/');
                return `${rootUrl}/${normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath}`;
              };

              return (
                <div key={ticket.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <div
                    onClick={() => handleExpand(ticket)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 20px',
                      transition: 'background-color 0.15s',
                      position: 'relative',
                      cursor: 'pointer',
                      backgroundColor: isExpanded ? 'var(--surface-hover)' : 'transparent'
                    }}
                    onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                    onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {/* Left accent */}
                    <div style={{
                      position: 'absolute', left: 0, top: '20%', bottom: '20%',
                      width: 3, background: accentColor, borderRadius: '0 2px 2px 0',
                    }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginLeft: 12, flex: 1 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 9,
                        background: `${accentColor}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Truck size={16} color={accentColor} />
                      </div>
                      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ticket</span>
                          <p style={{ margin: '0', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                            {ticket.rma}
                          </p>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</span>
                          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                            {ticket.customerName || ticket.name || 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vendor</span>
                          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                            {ticket.serviceVendor || 'Unassigned'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '20px 32px 24px', backgroundColor: '#f8fafc', borderTop: '1px dashed #e2e8f0' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
                            Courier Charges
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. ₹ 150"
                            value={courierCharge}
                            onChange={(e) => setCourierCharge(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
                            Docket Number
                          </label>
                          <input
                            type="text"
                            placeholder="Enter docket number"
                            value={docketNumber}
                            onChange={(e) => setDocketNumber(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
                          Docket Images
                        </label>

                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'stretch' }}>
                          <label style={{
                            width: '120px', height: '120px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            border: '2px dashed #cbd5e1', borderRadius: '12px', backgroundColor: 'white',
                            cursor: 'pointer', color: '#64748b', transition: 'all 0.2s'
                          }}>
                            <Upload size={24} />
                            <span style={{ fontSize: '12px', fontWeight: 500 }}>Upload</span>
                            <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                          </label>

                          {docketImages.map((img, i) => (
                            <div key={i} style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', backgroundColor: 'white' }}>
                              <img src={getFullUrl(img)} alt={`Docket ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button
                                onClick={() => removeImage(i)}
                                style={{ position: 'absolute', top: '6px', right: '6px', backgroundColor: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
                        {saveSuccess && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '13px', fontWeight: 600 }}>
                            <CheckCircle2 size={16} /> Saved Successfully!
                          </span>
                        )}
                        <button
                          onClick={() => setExpandedTicketId(null)}
                          style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSave(ticket)}
                          disabled={isSaving}
                          style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: isSaving ? 0.7 : 1 }}
                        >
                          <Save size={16} /> {isSaving ? 'Saving...' : 'Save Details'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourierChargesTab;
