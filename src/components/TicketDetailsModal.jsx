import { useState, useRef, useEffect } from 'react';
import { X, Plus, Eye, Save, Upload, ChevronDown, Search, ArrowRightCircle, Share, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';

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
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: 50, maxHeight: '250px', display: 'flex', flexDirection: 'column' }}>
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
  viewingItem, setViewingItem, recentActivities, categories, vendors, onSaveInlineService,
  setAdvancingItem, setAdvanceDate, setNewSerialNumber, setCourierCharge, getTodayDate, handleGenerateReport, userRole, fetchBackendData
}) {
  const [previewImage, setPreviewImage] = useState(null);
  const [inlineData, setInlineData] = useState({
    productName: '',
    category: categories ? categories[0] : '',
    serviceVendor: vendors ? vendors[0] : '',
    serialNumber: '',
    image: null,
    imageName: ''
  });

  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      await axios.delete(`${baseUrl}/tickets/${serviceId}`);
      if (fetchBackendData) fetchBackendData();
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
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      await axios.put(`${baseUrl}/tickets/${serviceId}`, {
        product: editData.productName,
        category: editData.category,
        serviceVendor: editData.serviceVendor,
        serialNumber: editData.serialNumber
      });
      setEditingServiceId(null);
      if (fetchBackendData) fetchBackendData();
    } catch (err) {
      console.error("Failed to update service:", err);
      alert("Failed to update service.");
    }
  };

  if (!viewingItem) return null;

  // Use viewingItem directly as there is only one product per ticket
  const service = viewingItem;

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
      category: categories ? categories[0] : '',
      serviceVendor: vendors ? vendors[0] : '',
      serialNumber: '',
      image: null,
      imageName: ''
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1200px', width: '90%', padding: '32px' }}>
        
        {/* Main Modal Header */}
        <div className="modal-header" style={{ marginBottom: '24px' }}>
          <div className="modal-title-group">
            <h2 className="modal-title">Ticket Overview</h2>
            <p className="modal-subtitle">{viewingItem.rma}</p>
          </div>
          <button className="modal-close-btn" onClick={() => setViewingItem(null)}>
            <X size={20} />
          </button>
        </div>

        {/* Customer Details Box */}
        <div style={{ backgroundColor: '#f8fafc', padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '32px', border: '1px solid #e2e8f0' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>Customer Name</div>
            <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 600 }}>{viewingItem.name}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>Contact</div>
            <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500 }}>{viewingItem.contactNumber}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>Email</div>
            <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500 }}>{viewingItem.email || 'N/A'}</div>
          </div>
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
                    options={categories} 
                    value={editData.category} 
                    onChange={(val) => setEditData({...editData, category: val})} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Vendor</label>
                  <SearchableDropdown 
                    options={vendors} 
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
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                  <button 
                    onClick={() => handleUpdateService(service.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}
                  >
                    <Save size={16} /> Save
                  </button>
                  <button 
                    onClick={() => setEditingServiceId(null)}
                    style={{ background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 500 }}
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
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>Image</div>
                    {service.inwardImageURL ? (
                      <button 
                        onClick={() => setPreviewImage(service.inwardImageURL)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0, fontSize: '14px', fontWeight: 500 }}
                      >
                        <Eye size={16} /> View Image
                      </button>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '14px' }}>No Image</span>
                    )}
                  </div>
                </div>
                
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
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '6px 12px', fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setAdvancingItem(service);
                              setAdvanceDate(getTodayDate());
                              setNewSerialNumber('');
                              setCourierCharge('');
                            }}
                          >
                            <ArrowRightCircle size={16} /> Advance Stage
                          </button>
                        ) : (
                          <button
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '6px', padding: '6px 12px', fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerateReport(service);
                            }}
                          >
                            <Share size={16} /> Generate Final Report
                          </button>
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
                              serialNumber: service.serialNumber || ''
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
    </div>
  );
}
