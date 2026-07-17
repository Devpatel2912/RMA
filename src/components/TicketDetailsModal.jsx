import { useState, useRef, useEffect } from 'react';
import { X, Plus, Eye, Save, Upload, ChevronDown, Search, ArrowRightCircle, Share, Edit2, Trash2, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { useCategories, useVendors, useTicket } from '../api/hooks';

const buildWhatsAppMessage = (ticket) => (
  `Dear ${ticket.name || 'Customer'},\n\n` +
  `Your RMA ticket ${ticket.rma || ''} for ${ticket.product || 'your product'} is ready.\n` +
  `Current status: ${ticket.status || 'N/A'}.\n` +
  `Serial No: ${ticket.serialNumber || 'N/A'}.\n\n` +
  `Thanks,\nAVXPERTS`
);

const SearchableDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const filteredOptions = options ? options.filter(opt => opt.toLowerCase().includes(search.toLowerCase())) : [];

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '36px' }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px', color: value ? '#0f172a' : '#94a3b8' }}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} color="#64748b" />
      </div>
      
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', boxShadow: 'none', zIndex: 50, maxHeight: '250px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '6px 6px 0 0' }}>
            <Search size={14} color="#94a3b8" style={{ marginRight: '8px' }} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '13px' }}
              onClick={e => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div style={{ overflowY: 'auto', padding: '4px' }}>
            {filteredOptions.length > 0 ? filteredOptions.map(opt => (
              <div 
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false); setSearch(''); }}
                style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', backgroundColor: value === opt ? '#f1f5f9' : 'transparent', fontSize: '13px', color: '#0f172a' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = value === opt ? '#f1f5f9' : 'transparent'}
              >
                {opt}
              </div>
            )) : (
              <div style={{ padding: '12px', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function TicketDetailsModal({ 
  viewingItem, setViewingItem, onSaveInlineService,
  setAdvancingItem, setAdvanceDate, setNewSerialNumber, setDocketNumber, setCourierCharge, getTodayDate, handleGenerateReport, handleSendWhatsAppReport, userRole
}) {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();
  const { data: vendors = [] } = useVendors();
  const { data: fullTicket } = useTicket(viewingItem?.id);
  const categoryNames = categories.map(c => c.name);
  const vendorNames = vendors.map(v => v.companyName);

  const [previewImage, setPreviewImage] = useState(null);
  const [inlineData, setInlineData] = useState({
    productName: '',
    category: categoryNames.length > 0 ? categoryNames[0] : '',
    serviceVendor: vendorNames.length > 0 ? vendorNames[0] : '',
    serialNumber: '',
    image: null,
    imageName: ''
  });

  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editData, setEditData] = useState({});
  const [whatsAppFormatOpen, setWhatsAppFormatOpen] = useState(false);
  const [whatsAppMessage, setWhatsAppMessage] = useState('');
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
      await axios.delete(`${baseUrl}/tickets/${serviceId}`);
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    } catch (err) {
      console.error("Failed to delete service:", err);
      alert("Failed to delete service.");
    }
  };

  const handleUpdateService = async (serviceId) => {
    try {
      if (!editData.productName || !editData.category || !editData.serviceVendor) {
        alert("Please fill required fields: Product, Category, Vendor");
        return;
      }
      setIsSaving(true);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
      await axios.put(`${baseUrl}/tickets/${serviceId}`, {
        product: editData.productName,
        category: editData.category,
        serviceVendor: editData.serviceVendor,
        serialNumber: editData.serialNumber,
        name: editData.name,
        contactNumber: editData.contactNumber,
        email: editData.email,
        description: editData.description,
        inwardImageURL: editData.inwardImageURL
      });
      setEditingServiceId(null);
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', serviceId] });
      alert("Ticket details updated successfully!");
    } catch (err) {
      console.error("Failed to update service:", err);
      alert("Failed to update service.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!viewingItem) return null;

  // Use fullTicket if available to get image data, otherwise fallback to viewingItem
  const service = fullTicket || viewingItem;
  const whatsAppMessageKey = `rma-whatsapp-message-${service.id || service.rma || 'ticket'}`;

  const openWhatsAppFormat = () => {
    const savedMessage = localStorage.getItem(whatsAppMessageKey);
    setWhatsAppMessage(savedMessage || buildWhatsAppMessage(service));
    setWhatsAppFormatOpen(true);
  };

  const saveWhatsAppMessage = () => {
    if (!whatsAppMessage.trim()) {
      alert("Message body is required.");
      return;
    }

    localStorage.setItem(whatsAppMessageKey, whatsAppMessage.trim());
    alert("WhatsApp message saved.");
  };

  const sendWhatsAppMessage = async () => {
    if (!service.contactNumber) {
      alert("Customer mobile number is missing.");
      return;
    }

    if (!whatsAppMessage.trim()) {
      alert("Message body is required.");
      return;
    }

    setIsSendingWhatsApp(true);
    try {
      await handleSendWhatsAppReport(service, whatsAppMessage.trim());
      setWhatsAppFormatOpen(false);
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handleInlineImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInlineData(prev => ({
          ...prev,
          image: event.target.result,
          imageName: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveInline = () => {
    if (!inlineData.productName || !inlineData.category || !inlineData.serviceVendor) {
      alert("Please fill required fields: Product, Category, Vendor");
      return;
    }
    
    if (onSaveInlineService) {
      onSaveInlineService(inlineData);
    }
    
    // Reset and close

    setInlineData({
      productName: '',
      category: categoryNames.length > 0 ? categoryNames[0] : '',
      serviceVendor: vendorNames.length > 0 ? vendorNames[0] : '',
      serialNumber: '',
      image: null,
      imageName: ''
    });
  };

  const handleEditImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const fileReaders = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileReaders).then(base64Images => {
      setEditData(prev => {
        let existing = [];
        // Append to existing images if any
        if (prev.inwardImageURL) {
          try {
            const parsed = JSON.parse(prev.inwardImageURL);
            existing = Array.isArray(parsed) ? parsed : [prev.inwardImageURL];
          } catch(e) {
            existing = [prev.inwardImageURL];
          }
        }
        return {
          ...prev,
          inwardImageURL: JSON.stringify([...existing, ...base64Images])
        };
      });
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1200px', width: '90%', padding: '32px' }}>
        
        {/* Main Modal Header */}
        <div className="modal-header" style={{ marginBottom: '24px' }}>
          <div className="modal-title-group">
            <h2 className="modal-title">Ticket Overview</h2>
            <p className="modal-subtitle">{service.rma}</p>
          </div>
          <button className="modal-close-btn" onClick={() => setViewingItem(null)}>
            <X size={20} />
          </button>
        </div>

        {/* Customer Details Box */}
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
          {editingServiceId === service.id ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>Customer Name</label>
                <input 
                  type="text" 
                  value={editData.name || ''} 
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>Contact</label>
                <input 
                  type="text" 
                  value={editData.contactNumber || ''} 
                  onChange={(e) => setEditData({...editData, contactNumber: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>Email</label>
                <input 
                  type="text" 
                  value={editData.email || ''} 
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>Problem Description</label>
                <textarea 
                  value={editData.description || ''} 
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', minHeight: '80px' }}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>Customer Name</div>
                <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 600 }}>{service.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>Contact</div>
                <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500 }}>{service.contactNumber}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>Email</div>
                <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500 }}>{service.email || 'N/A'}</div>
              </div>
              {service.description && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>Problem Description</div>
                  <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6', backgroundColor: 'white', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>{service.description}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Product Details Box */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', marginBottom: '16px' }}>Product Details</h3>
          
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', backgroundColor: '#fff', position: 'relative' }}>
            {editingServiceId === service.id ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Product Name</label>
                  <input 
                    type="text" 
                    value={editData.productName} 
                    onChange={(e) => setEditData({...editData, productName: e.target.value})}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Category</label>
                  <SearchableDropdown 
                    options={categoryNames} 
                    value={editData.category} 
                    onChange={(val) => setEditData({...editData, category: val})} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Vendor</label>
                  <SearchableDropdown 
                    options={vendorNames} 
                    value={editData.serviceVendor} 
                    onChange={(val) => setEditData({...editData, serviceVendor: val})} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Serial Number</label>
                  <input 
                    type="text" 
                    value={editData.serialNumber} 
                    onChange={(e) => setEditData({...editData, serialNumber: e.target.value})}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Update Inward Image(s)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(() => {
                      let images = [];
                      if (editData.inwardImageURL) {
                        try {
                          images = JSON.parse(editData.inwardImageURL);
                          if (!Array.isArray(images)) images = [editData.inwardImageURL];
                        } catch (e) {
                          images = [editData.inwardImageURL];
                        }
                      }
                      
                      if (images.length > 0) {
                        return (
                          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                            {images.map((imgSrc, idx) => (
                              <div key={idx} style={{ width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', flexShrink: 0, position: 'relative' }}>
                                <img src={imgSrc} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newImages = images.filter((_, i) => i !== idx);
                                    setEditData(prev => ({ ...prev, inwardImageURL: newImages.length > 0 ? JSON.stringify(newImages) : '' }));
                                  }}
                                  style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <div>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: '#475569', fontWeight: 500 }}>
                        <Upload size={16} /> Add Image(s)
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple
                          onChange={handleEditImageChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {editData.inwardImageURL && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Eye size={12} /> Images attached
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                  <button 
                    onClick={() => handleUpdateService(service.id)}
                    disabled={isSaving}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 500, fontSize: '14px', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.75 : 1 }}
                  >
                    <Save size={16} /> {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={() => setEditingServiceId(null)}
                    disabled={isSaving}
                    style={{ background: '#f1f5f9', border: 'none', color: '#64748b', cursor: isSaving ? 'not-allowed' : 'pointer', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, opacity: isSaving ? 0.75 : 1 }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>Product</div>
                    <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500 }}>{service.product}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>Category</div>
                    <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500 }}>{service.category}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>Vendor</div>
                    <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500 }}>{service.serviceVendor}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>Serial Number</div>
                    <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500 }}>{service.serialNumber || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>Date</div>
                    <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500 }}>{service.date || 'N/A'}</div>
                  </div>
                </div>

                {/* Inward Image — shown prominently */}
                {(() => {
                  let images = [];
                  if (service.inwardImageURL) {
                    try {
                      images = JSON.parse(service.inwardImageURL);
                      if (!Array.isArray(images)) images = [service.inwardImageURL];
                    } catch (e) {
                      images = [service.inwardImageURL];
                    }
                  }
                  
                  if (images.length === 0) return null;

                  return (
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '10px' }}>
                        Inward Image{images.length > 1 ? 's' : ''}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {images.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            onClick={() => setPreviewImage(imgUrl)}
                            style={{ flexShrink: 0, cursor: 'zoom-in', display: 'inline-block', borderRadius: '10px', overflow: 'hidden', border: '2px solid #e2e8f0', boxShadow: 'none', transition: 'box-shadow 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(16,185,129,0.25)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
                            title="Click to view full size"
                          >
                            <img
                              src={imgUrl}
                              alt={`Inward ${idx + 1}`}
                              style={{ maxHeight: '160px', maxWidth: '100%', display: 'block', objectFit: 'contain' }}
                            />
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>Click image to view full size</div>
                    </div>
                  );
                })()}
                
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Current Stage</span>
                    <span className={`status-badge ${service.statusClass}`} style={{ fontSize: '12px', padding: '4px 10px' }}>
                      {service.status}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {userRole === 'ADMIN' ? (
                      <>
                        {service.status !== 'CUSTOMER OUTWARD' && service.status !== 'COMPLETED' ? (
                          <button
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#ecfdf5', color: '#10b981', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '6px 12px', fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setAdvancingItem(service);
                              setAdvanceDate(getTodayDate());
                              setNewSerialNumber('');
                              if (setDocketNumber) setDocketNumber('');
                              setCourierCharge('');
                            }}
                            title="Advance to next stage"
                          >
                            <ArrowRightCircle size={16} /> Advance Stage
                          </button>
                        ) : (
                          <>
                            <button
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '6px', padding: '6px 12px', fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateReport(service);
                              }}
                            >
                              <Share size={16} /> Generate Final Report
                            </button>
                            <button
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#dcfce7', color: '#16a34a', border: '1px solid #86efac', borderRadius: '6px', padding: '6px 12px', fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openWhatsAppFormat();
                              }}
                              title="Open WhatsApp format"
                            >
                              <MessageCircle size={16} /> WhatsApp
                            </button>
                          </>
                        )}
                        <button
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fefce8', color: '#eab308', border: '1px solid #fef08a', borderRadius: '6px', padding: '6px 12px', fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingServiceId(service.id);
                            setEditData({
                              productName: service.product,
                              category: service.category,
                              serviceVendor: service.serviceVendor,
                              serialNumber: service.serialNumber || '',
                              name: service.name,
                              contactNumber: service.contactNumber,
                              email: service.email || '',
                              description: service.description || '',
                              inwardImageURL: service.inwardImageURL || ''
                            });
                          }}
                        >
                          <Edit2 size={16} /> Edit
                        </button>
                        <button
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', padding: '6px 12px', fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteService(service.id);
                          }}
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </>
                    ) : (
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>Admin actions restricted</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          <button className="btn-cancel" onClick={() => setViewingItem(null)}>Close</button>
        </div>
      </div>

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }}
            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <X size={32} />
          </button>
          <img src={previewImage} alt="Preview" style={{ maxWidth: '90%', maxHeight: '85vh', borderRadius: '8px', objectFit: 'contain' }} />
        </div>
      )}

      {whatsAppFormatOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.45)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div style={{ width: '100%', maxWidth: '760px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'none', overflow: 'hidden' }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: '8px 12px', fontWeight: 700, fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>WhatsApp Format</span>
              <button
                onClick={() => setWhatsAppFormatOpen(false)}
                style={{ width: '24px', height: '24px', border: 'none', background: '#ef4444', color: 'white', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px 12px', alignItems: 'center', background: 'var(--surface)' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Profile Type</label>
              <input value="Default" readOnly style={{ height: '30px', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px 8px', background: 'var(--surface-hover)', color: 'var(--text-secondary)' }} />

              <label style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Profile ID</label>
              <input value={service.rma || ''} readOnly style={{ height: '30px', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px 8px', background: 'var(--surface-hover)', color: 'var(--text-secondary)' }} />

              <label style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Format Name</label>
              <input value="RMA Customer Status" readOnly style={{ height: '30px', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px 8px', background: 'var(--surface-hover)', color: 'var(--text-primary)' }} />

              <label style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Mobile No.</label>
              <input value={service.contactNumber || ''} readOnly style={{ height: '30px', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px 8px', background: 'var(--surface-hover)', color: 'var(--text-primary)' }} />

              <label style={{ fontSize: '13px', color: 'var(--text-primary)', alignSelf: 'start', paddingTop: '8px' }}>Message Body</label>
              <textarea
                value={whatsAppMessage}
                onChange={(e) => setWhatsAppMessage(e.target.value)}
                rows={8}
                style={{ resize: 'vertical', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px', background: 'var(--surface-hover)', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: 1.5 }}
              />

              <label style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Attachment</label>
              <input value="STATIC MESSAGE" readOnly style={{ height: '30px', maxWidth: '320px', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px 8px', background: 'var(--surface-hover)', color: 'var(--text-primary)' }} />

              <label style={{ fontSize: '13px', color: 'var(--text-primary)' }}>File Type</label>
              <input value="None" readOnly style={{ height: '30px', maxWidth: '320px', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px 8px', background: 'var(--surface-hover)', color: 'var(--text-primary)' }} />

              <label style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Log Type</label>
              <input value="Log Without Attachment" readOnly style={{ height: '30px', maxWidth: '320px', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px 8px', background: 'var(--surface-hover)', color: 'var(--text-primary)' }} />

              <label style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Current Stage</label>
              <input value={service.status || 'N/A'} readOnly style={{ height: '30px', maxWidth: '320px', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px 8px', background: 'var(--surface-hover)', color: 'var(--text-primary)' }} />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', padding: '12px', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: 'var(--surface-hover)' }}>
              <button
                onClick={() => setWhatsAppFormatOpen(false)}
                style={{ border: '1px solid #cbd5e1', background: 'white', color: '#475569', borderRadius: '6px', padding: '8px 14px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={saveWhatsAppMessage}
                style={{ border: '1px solid var(--primary)', background: 'var(--primary)', color: 'white', borderRadius: '6px', padding: '8px 14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Save size={16} /> Save
              </button>
              <button
                onClick={sendWhatsAppMessage}
                disabled={isSendingWhatsApp}
                style={{ border: '1px solid #16a34a', background: '#16a34a', color: 'white', borderRadius: '6px', padding: '8px 14px', fontWeight: 700, cursor: isSendingWhatsApp ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: isSendingWhatsApp ? 0.75 : 1 }}
              >
                <MessageCircle size={16} /> {isSendingWhatsApp ? 'Sending...' : 'Send WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
