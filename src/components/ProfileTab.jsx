import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { User, MapPin, Hash, Phone, Mail, Globe, Save, Edit2 } from 'lucide-react';
import { useProfile } from '../api/hooks';
import Spinner, { SkeletonLoader } from './Spinner';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';

export default function ProfileTab() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    pincode: '',
    phoneNumber: '',
    email: '',
    website: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        address: profile.address || '',
        pincode: profile.pincode || '',
        phoneNumber: profile.phoneNumber || '',
        email: profile.email || '',
        website: profile.website || ''
      });
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put(`${baseUrl}/profile`, formData);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <SkeletonLoader rows={5} />;
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
            <User size={20} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 className="page-title" style={{ fontSize: 22, margin: 0 }}>Company Profile</h1>
              {!isEditing && (
                <button
                  className="btn-save"
                  onClick={() => setIsEditing(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', width: 'auto', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', boxShadow: 'none', fontSize: '12px', borderRadius: '6px', height: 'auto', minHeight: 'unset' }}
                >
                  <Edit2 size={13} /> Edit Profile
                </button>
              )}
            </div>
            <p className="page-subtitle" style={{ margin: '2px 0 0 0' }}>Manage company details for reports and communication</p>
          </div>
        </div>

        {isEditing && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn-cancel"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  address: profile.address || '',
                  pincode: profile.pincode || '',
                  phoneNumber: profile.phoneNumber || '',
                  email: profile.email || '',
                  website: profile.website || ''
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
          
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Company Address</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 12, pointerEvents: 'none' }} />
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Enter full company address"
                  style={{ ...inputStyle, paddingLeft: 40, resize: 'vertical' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(4,120,87,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
              ) : (
                <div style={{ ...inputStyle, paddingLeft: 40, background: 'var(--surface-hover)', minHeight: 44, height: 'auto', whiteSpace: 'pre-wrap' }}>
                  {formData.address || <span style={{ color: 'var(--text-muted)' }}>Not specified</span>}
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
                  {formData.pincode || <span style={{ color: 'var(--text-muted)' }}>Not specified</span>}
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Contact Number</label>
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
                  {formData.phoneNumber || <span style={{ color: 'var(--text-muted)' }}>Not specified</span>}
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. contact@company.com"
                  style={{ ...inputStyle, paddingLeft: 40 }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(4,120,87,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
              ) : (
                <div style={{ ...inputStyle, paddingLeft: 40, background: 'var(--surface-hover)' }}>
                  {formData.email || <span style={{ color: 'var(--text-muted)' }}>Not specified</span>}
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Website URL</label>
            <div style={{ position: 'relative' }}>
              <Globe size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              {isEditing ? (
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="e.g. https://www.company.com"
                  style={{ ...inputStyle, paddingLeft: 40 }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(4,120,87,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
              ) : (
                <div style={{ ...inputStyle, paddingLeft: 40, background: 'var(--surface-hover)' }}>
                  {formData.website || <span style={{ color: 'var(--text-muted)' }}>Not specified</span>}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
