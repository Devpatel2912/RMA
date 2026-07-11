import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, User, Package, Tag, Building2, Hash, Mail, Calendar, FileText, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import CameraCapture from './CameraCapture';
import { useCategories, useVendors } from '../api/hooks';
import Spinner from './Spinner';

/* ─────────── Searchable Dropdown ─────────── */
const SearchableDropdown = ({ options, value, onChange, placeholder, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
          border: `1.5px solid ${isOpen ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)',
          background: 'var(--surface-hover)',
          cursor: 'pointer', userSelect: 'none',
          boxShadow: isOpen ? '0 0 0 3px rgba(4,120,87,0.12)' : 'none',
          transition: 'all 0.18s',
        }}
      >
        {Icon && <Icon size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />}
        <span style={{ flex: 1, fontSize: 14, color: value ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {value || placeholder}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={isOpen ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'} />
        </svg>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          marginTop: 6, background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
          boxShadow: 'none', zIndex: 100,
          overflow: 'hidden', maxHeight: 240,
        }}>
          <div style={{ padding: '8px', borderBottom: '1px solid var(--border)', background: 'var(--surface-hover)' }}>
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', border: 'none', outline: 'none',
                background: 'transparent', fontSize: 13,
                color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif',
              }}
            />
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 190 }}>
            {filtered.length > 0 ? filtered.map((opt, i) => (
              <div
                key={i}
                onClick={() => { onChange(opt); setIsOpen(false); setSearchTerm(''); }}
                style={{
                  padding: '10px 16px', fontSize: 13.5, cursor: 'pointer',
                  color: 'var(--text-primary)',
                  background: value === opt ? 'var(--primary-light)' : 'transparent',
                  fontWeight: value === opt ? 600 : 400,
                  borderBottom: '1px solid var(--border)',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { if (value !== opt) e.currentTarget.style.background = 'var(--surface-hover)'; }}
                onMouseLeave={e => { if (value !== opt) e.currentTarget.style.background = 'transparent'; }}
              >
                {opt}
              </div>
            )) : (
              <div style={{ padding: 16, color: 'var(--text-muted)', textAlign: 'center', fontSize: 13 }}>No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────── Workflow Steps (right panel) ─────────── */
const WORKFLOW_STEPS = [
  { label: 'Customer Inward',  desc: 'Active Process',  color: '#047857' },
  { label: 'Vendor Dispatch',  desc: 'Pending Entry',   color: '#F59E0B' },
  { label: 'Resolution',       desc: 'Awaiting Return', color: '#22C55E' },
];

/* ─────────── Field Row ─────────── */
const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {label}
    </label>
    {children}
  </div>
);

/* ─────────── Main Modal ─────────── */
export default function NewInwardModal({ setIsModalOpen, formData, setFormData, handleInputChange, handleSaveInward, isSaving }) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const { data: categories = [] } = useCategories();
  const { data: vendors = [] } = useVendors();

  const categoryNames = categories.map(c => c.name);
  const vendorNames = vendors.map(v => v.companyName);

  // Generate a preview RMA number
  const previewRma = formData.rma || `RMA-${Math.floor(100000 + Math.random() * 900000).toString().slice(0, 6)}`;

  const inputStyle = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--surface-hover)',
    fontSize: 14, color: 'var(--text-primary)',
    fontFamily: 'Inter, sans-serif',
    width: '100%', outline: 'none',
    transition: 'all 0.18s',
  };

  return (
    <div className="modal-overlay" style={{ padding: '16px', alignItems: 'center' }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          borderRadius: 20,
          width: '100%',
          maxWidth: 900,
          maxHeight: '94dvh',
          overflowY: 'auto',
          boxShadow: 'none',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modal-slide-in 0.25s cubic-bezier(.34,1.56,.64,1) both',
          position: 'relative',
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: '20px 20px 0 0' }} />

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 28px', borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--primary), #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'none',
            }}>
              <FileText size={19} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                Customer Inward Form
              </h2>
              <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                Initialize a new replacement ticket for returned merchandise.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'var(--surface-hover)', border: '1px solid var(--border)',
                color: 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--error-light)'; e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.borderColor = 'var(--error-border)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* ── Body: Two columns ── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* LEFT: Form */}
          <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Section: Customer Information */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={14} color="var(--primary)" />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>Customer Information</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)', marginLeft: 4 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Customer Name *">
                  <div style={{ position: 'relative' }}>
                    <User size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="text" name="customerName" value={formData.customerName}
                      onChange={handleInputChange} placeholder="Full legal name"
                      style={{ ...inputStyle, paddingLeft: 36 }}
                      onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(4,120,87,0.12)'; e.target.style.background = 'var(--surface)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'var(--surface-hover)'; }}
                    />
                  </div>
                </Field>

                <Field label="Contact Number (WhatsApp) *">
                  <div style={{
                    display: 'flex', border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                    background: 'var(--surface-hover)', transition: 'all 0.18s',
                  }}
                    onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(4,120,87,0.12)'; e.currentTarget.style.background = 'var(--surface)'; }}
                    onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'var(--surface-hover)'; }}
                  >
                    <span style={{ padding: '10px 12px', background: 'var(--surface-hover)', color: 'var(--text-secondary)', borderRight: '1px solid var(--border)', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', flexShrink: 0 }}>+91</span>
                    <input
                      type="text" name="contactNumber" maxLength="10"
                      placeholder="+1 (555) 000-0000"
                      value={formData.contactNumber ? formData.contactNumber.replace(/^\+91\s*/, '') : ''}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        handleInputChange({ target: { name: 'contactNumber', value: val ? `+91 ${val}` : '' } });
                      }}
                      style={{ border: 'none', outline: 'none', width: '100%', padding: '10px 12px', fontSize: 14, background: 'transparent', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                </Field>

                <Field label="Email Address (Optional)">
                  <div style={{ position: 'relative' }}>
                    <Mail size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="email" name="email" value={formData.email}
                      onChange={handleInputChange} placeholder="customer@example.com"
                      style={{ ...inputStyle, paddingLeft: 36 }}
                      onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(4,120,87,0.12)'; e.target.style.background = 'var(--surface)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'var(--surface-hover)'; }}
                    />
                  </div>
                </Field>

                <Field label="Inward Date *">
                  <div style={{ position: 'relative' }}>
                    <input
                      type="date" name="inwardDate" value={formData.inwardDate}
                      onChange={handleInputChange}
                      style={{ ...inputStyle }}
                      onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(4,120,87,0.12)'; e.target.style.background = 'var(--surface)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'var(--surface-hover)'; }}
                    />
                  </div>
                </Field>

                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label="Permanent Address">
                    <textarea
                      name="customerAddress" value={formData.customerAddress || ''}
                      onChange={handleInputChange} rows={2}
                      placeholder="Street, Building, City, State, Zip"
                      style={{ ...inputStyle, resize: 'vertical', alignItems: 'flex-start', minHeight: 72, lineHeight: 1.5 }}
                      onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(4,120,87,0.12)'; e.target.style.background = 'var(--surface)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'var(--surface-hover)'; }}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* Section: Product Specifications */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={14} color="#8B5CF6" />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>Product Specifications</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)', marginLeft: 4 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label="Product Name / Model *">
                    <div style={{ position: 'relative' }}>
                      <Package size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input
                        type="text" name="productName" value={formData.productName}
                        onChange={handleInputChange} placeholder="e.g., Precision Pro X1"
                        style={{ ...inputStyle, paddingLeft: 36 }}
                        onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(4,120,87,0.12)'; e.target.style.background = 'var(--surface)'; }}
                        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'var(--surface-hover)'; }}
                      />
                    </div>
                  </Field>
                </div>

                <Field label="Original Serial # (Optional)">
                  <div style={{ position: 'relative' }}>
                    <Hash size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="text" name="serialNumber" value={formData.serialNumber}
                      onChange={handleInputChange} placeholder="SN-XXXX-XXXX"
                      style={{ ...inputStyle, paddingLeft: 36, fontFamily: 'monospace' }}
                      onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(4,120,87,0.12)'; e.target.style.background = 'var(--surface)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'var(--surface-hover)'; }}
                    />
                  </div>
                </Field>

                {/* Category */}
                <Field label="Category *">
                  <SearchableDropdown
                    icon={Tag}
                    options={categoryNames}
                    value={formData.category}
                    onChange={val => handleInputChange({ target: { name: 'category', value: val } })}
                    placeholder="Select Category"
                  />
                </Field>

                {/* Service Vendor */}
                <Field label="Service Vendor *">
                  <SearchableDropdown
                    icon={Building2}
                    options={vendorNames}
                    value={formData.serviceVendor}
                    onChange={val => setFormData(prev => ({ ...prev, serviceVendor: val }))}
                    placeholder="Assign Vendor"
                  />
                </Field>

                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label="Detailed Problem Description *">
                    <textarea
                      name="description" value={formData.description}
                      onChange={handleInputChange} rows={3}
                      placeholder="Please describe the malfunction or reason for return in detail..."
                      style={{ ...inputStyle, resize: 'vertical', alignItems: 'flex-start', lineHeight: 1.6 }}
                      onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(4,120,87,0.12)'; e.target.style.background = 'var(--surface)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'var(--surface-hover)'; }}
                    />
                  </Field>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Visual Proof + Workflow Status */}
          <div style={{
            width: 260, borderLeft: '1px solid var(--border)',
            background: 'var(--surface-hover)', flexShrink: 0,
            display: 'flex', flexDirection: 'column', padding: '24px 20px', gap: 24,
            overflowY: 'auto',
          }}>

            {/* Visual Proof */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Camera size={14} color="var(--primary)" />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Visual Proof
                </span>
              </div>

              {/* Camera Open */}
              {isCameraOpen ? (
                <CameraCapture
                  onCapture={file => { setFormData(prev => ({ ...prev, image: file })); setIsCameraOpen(false); }}
                  onCancel={() => setIsCameraOpen(false)}
                />
              ) : !formData.image ? (
                <>
                  {/* Drop zone */}
                  <div style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '28px 16px', textAlign: 'center',
                    background: 'var(--surface)',
                    marginBottom: 10,
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                      <Upload size={18} color="var(--text-muted)" />
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Drag & drop product images<br />
                      <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>JPEG, PNG up to 10MB</span>
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      style={{
                        flex: 1, padding: '9px 10px', border: '1.5px solid var(--border)',
                        borderRadius: 8, cursor: 'pointer', background: 'var(--surface)',
                        fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--surface)'; }}
                    >
                      <Camera size={14} /> Camera
                    </button>
                    <label
                      style={{
                        flex: 1, padding: '9px 10px', border: '1.5px solid var(--border)',
                        borderRadius: 8, cursor: 'pointer', background: 'var(--surface)',
                        fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        transition: 'all 0.15s', userSelect: 'none',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--surface)'; }}
                    >
                      <Upload size={14} /> Upload
                      <input type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={e => setFormData(prev => ({ ...prev, image: e.target.files[0] }))}
                      />
                    </label>
                  </div>
                </>
              ) : (
                /* Image Preview */
                <div style={{ position: 'relative' }}>
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Preview"
                    style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)', display: 'block', objectFit: 'cover', maxHeight: 160 }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                    style={{
                      position: 'absolute', top: -8, right: -8,
                      width: 26, height: 26, borderRadius: '50%',
                      background: 'var(--error)', color: 'white',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: 'none',
                    }}
                  >
                    <X size={13} />
                  </button>
                  <p style={{ margin: '8px 0 0', fontSize: 11.5, color: 'var(--success)', fontWeight: 600 }}>
                    ✓ {formData.image.name}
                  </p>
                </div>
              )}
            </div>


          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: '16px 28px', borderTop: '1px solid var(--border)',
          background: 'var(--surface-hover)',
          display: 'flex', justifyContent: 'flex-end', gap: 12,
          borderRadius: '0 0 20px 20px',
        }}>
          <button
            onClick={() => setIsModalOpen(false)}
            disabled={isSaving}
            style={{
              padding: '10px 24px', border: '1.5px solid var(--border)',
              borderRadius: 9, background: 'var(--surface)', color: 'var(--text-secondary)',
              fontSize: 13.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveInward}
            disabled={isSaving}
            style={{
              padding: '10px 28px', border: 'none',
              borderRadius: 9,
              background: isSaving ? 'var(--border)' : 'linear-gradient(135deg, var(--primary), #065f46)',
              color: isSaving ? 'var(--text-muted)' : 'white',
              fontSize: 13.5, fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 9,
              boxShadow: isSaving ? 'none' : '0 4px 14px rgba(4,120,87,0.4)',
              transition: 'all 0.18s', fontFamily: 'Inter, sans-serif',
            }}
          >
            {isSaving && <Spinner size="xs" variant="white" />}
            {isSaving ? 'Saving…' : 'Add Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}
