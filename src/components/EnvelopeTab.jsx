import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { Mail, MapPin, Hash, Phone, Save, Printer, Ticket } from 'lucide-react';
import { useEnvelope, useProfile, useTickets } from '../api/hooks';
import { generateEnvelopePDF } from '../utils/envelopePdfGenerator';
import Spinner, { SkeletonLoader } from './Spinner';
import CustomDropdown from './CustomDropdown';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';

const extractPincode = (address = '') => {
  const match = String(address).match(/\b\d{6}\b/);
  return match ? match[0] : '';
};

const getTicketEnvelopeData = (ticket, tickets = []) => {
  if (!ticket) return { address: '', pincode: '', phoneNumber: '' };
  const fallbackTicket = tickets.find(candidate =>
    candidate.id !== ticket.id &&
    (candidate.contactNumber && candidate.contactNumber === ticket.contactNumber ||
      candidate.name && candidate.name === ticket.name) &&
    (candidate.customerAddress || candidate.pincode)
  );

  const address = ticket.customerAddress || fallbackTicket?.customerAddress || '';

  return {
    address,
    pincode: ticket.pincode || fallbackTicket?.pincode || extractPincode(address),
    phoneNumber: ticket.contactNumber || '',
  };
};

export default function EnvelopeTab() {
  const queryClient = useQueryClient();
  const { data: envelope, isLoading } = useEnvelope();
  const { data: profile } = useProfile();
  const { data: tickets = [], isLoading: isTicketsLoading } = useTickets();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [formData, setFormData] = useState({
    address: '',
    pincode: '',
    phoneNumber: ''
  });

  useEffect(() => {
    if (envelope) {
      setFormData({
        address: envelope.address || '',
        pincode: envelope.pincode || '',
        phoneNumber: envelope.phoneNumber || ''
      });
    }
  }, [envelope]);

  useEffect(() => {
    if (!selectedTicketId && tickets.length > 0) {
      const ticketWithAddress = tickets.find(ticket => ticket.customerAddress || ticket.pincode);
      setSelectedTicketId((ticketWithAddress || tickets[0]).id);
    }
  }, [selectedTicketId, tickets]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put(`${baseUrl}/envelope`, formData);
      queryClient.invalidateQueries({ queryKey: ['envelope'] });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update envelope settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <SkeletonLoader rows={3} />;
  }

  const inputStyle = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px', border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-sm)', background: 'var(--surface)',
    fontSize: 14, color: 'var(--text-primary)',
    fontFamily: 'Inter, sans-serif', width: '100%',
    outline: 'none', transition: 'all 0.18s',
  };

  const labelStyle = {
    fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block'
  };

  const selectedTicket = tickets.find(ticket => ticket.id === selectedTicketId);
  const selectedEnvelope = getTicketEnvelopeData(selectedTicket, tickets);
  const ticketOptions = [
    { value: '', label: isTicketsLoading ? 'Loading tickets...' : 'Select ticket...' },
    ...tickets.map(ticket => ({
      value: ticket.id,
      label: `${ticket.name || 'Customer'} - ${ticket.rma || ticket.id}`,
    })),
  ];

  return (
    <>
      {/* Page Header */}
      <div className="header" style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Mail size={20} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 className="page-title" style={{ fontSize: 22, margin: 0 }}>Envelope Settings</h1>
              {!isEditing && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      if (!selectedTicket) {
                        alert('Please select a ticket before printing.');
                        return;
                      }
                      generateEnvelopePDF(selectedEnvelope, profile);
                    }}
                    disabled={!selectedTicket}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', width: 'auto', background: 'var(--surface)', color: selectedTicket ? 'var(--text-primary)' : 'var(--text-muted)', border: '1px solid var(--border)', boxShadow: 'none', fontSize: '12px', borderRadius: '6px', height: 'auto', minHeight: 'unset', cursor: selectedTicket ? 'pointer' : 'not-allowed', opacity: selectedTicket ? 1 : 0.65 }}
                  >
                    <Printer size={13} /> Print
                  </button>
                </div>
              )}
            </div>
            <p className="page-subtitle" style={{ margin: '2px 0 0 0' }}>Manage return address settings for envelope printing</p>
          </div>
        </div>

        {isEditing && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn-cancel"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  address: envelope.address || '',
                  pincode: envelope.pincode || '',
                  phoneNumber: envelope.phoneNumber || ''
                });
              }}
              style={{ width: 'auto' }}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              className="btn-save"
              onClick={handleSave}
              disabled={isSaving}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', width: 'auto' }}
            >
              {isSaving ? <Spinner size="xs" variant="white" /> : <Save size={16} />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {!isEditing && (
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Select Ticket</label>
              <div style={{ position: 'relative' }}>
                <Ticket size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 2 }} />
                <CustomDropdown
                  value={selectedTicketId}
                  options={ticketOptions}
                  onChange={setSelectedTicketId}
                  disabled={isTicketsLoading || tickets.length === 0}
                  className="envelope-ticket-dropdown"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}
          
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Address</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 12, pointerEvents: 'none' }} />
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Enter address for envelope"
                  style={{ ...inputStyle, paddingLeft: 40, resize: 'vertical' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(4,120,87,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
              ) : (
                <div style={{ ...inputStyle, paddingLeft: 40, background: 'var(--surface-hover)', minHeight: 44, height: 'auto', whiteSpace: 'pre-wrap' }}>
                  {selectedEnvelope.address || <span style={{ color: 'var(--text-muted)' }}>No address found for selected ticket</span>}
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Pincode</label>
            <div style={{ position: 'relative' }}>
              <Hash size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              {isEditing ? (
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="e.g. 400001"
                  style={{ ...inputStyle, paddingLeft: 40 }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(4,120,87,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
              ) : (
                <div style={{ ...inputStyle, paddingLeft: 40, background: 'var(--surface-hover)' }}>
                  {selectedEnvelope.pincode || <span style={{ color: 'var(--text-muted)' }}>No pincode found</span>}
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              {isEditing ? (
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. +91 9876543210"
                  style={{ ...inputStyle, paddingLeft: 40 }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(4,120,87,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
              ) : (
                <div style={{ ...inputStyle, paddingLeft: 40, background: 'var(--surface-hover)' }}>
                  {selectedEnvelope.phoneNumber || <span style={{ color: 'var(--text-muted)' }}>No mobile number found</span>}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
