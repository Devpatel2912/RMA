import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

const SearchableDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <div
        className="form-select"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <span style={{ color: value ? 'inherit' : '#94a3b8' }}>
          {value || placeholder}
        </span>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          marginTop: '4px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '6px 12px' }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    backgroundColor: value === opt ? '#f1f5f9' : 'transparent',
                    color: '#0f172a',
                    borderBottom: idx < filteredOptions.length - 1 ? '1px solid #f1f5f9' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (value !== opt) e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (value !== opt) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {opt}
                </div>
              ))
            ) : (
              <div style={{ padding: '8px 12px', color: '#64748b', textAlign: 'center', fontSize: '14px' }}>
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function NewInwardModal({ setIsModalOpen, formData, setFormData, handleInputChange, categories, vendors, handleSaveInward }) {
  return (
    <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 className="modal-title">Customer Inward</h2>
            <p className="modal-subtitle">Initialize a new replacement ticket.</p>
          </div>
          <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. John Doe"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number (WhatsApp Number)</label>
              <input
                type="text"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Product Name / Model</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. ASUS ROG Strix B550-F"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <SearchableDropdown
                options={categories}
                value={formData.category}
                onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                placeholder="Select category..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Service Vendor</label>
              <SearchableDropdown
                options={vendors}
                value={formData.serviceVendor}
                onChange={(val) => setFormData(prev => ({ ...prev, serviceVendor: val }))}
                placeholder="Select vendor..."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Original Serial #</label>
              <input
                type="text"
                className="form-input"
                placeholder="S/N: XXX-XXX-XXX"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="john@example.com"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Upload Image</label>
              <input
                type="file"
                className="form-input"
                accept="image/*"
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files[0] }))}
                style={{ padding: '8px' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Inward Date</label>
              <input
                type="date"
                className="form-input"
                name="inwardDate"
                value={formData.inwardDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Problem Description</label>
            <textarea
              className="form-textarea"
              placeholder="Describe the issue reported by the customer..."
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            ></textarea>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
          <button className="btn-save" onClick={handleSaveInward}>Save Inward Entry</button>
        </div>
      </div>
    </div>
  );
}
