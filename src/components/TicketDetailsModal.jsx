import { useState, useRef, useEffect } from 'react';
import { X, Plus, Eye, Save, Upload, ChevronDown, Search, ArrowRightCircle, Share } from 'lucide-react';

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
  setAdvancingItem, setAdvanceDate, setNewSerialNumber, setCourierCharge, getTodayDate, handleGenerateReport, userRole
}) {
  const [isAddingService, setIsAddingService] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [inlineData, setInlineData] = useState({
    productName: '',
    category: categories ? categories[0] : '',
    serviceVendor: vendors ? vendors[0] : '',
    serialNumber: '',
    image: null,
    imageName: ''
  });

  if (!viewingItem) return null;

  // Get all services belonging to this RMA ticket
  const ticketServices = recentActivities ? recentActivities.filter(item => item.rma === viewingItem.rma) : [viewingItem];

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
    setIsAddingService(false);
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
    <div className="modal-overlay" onClick={() => { if (!previewImage) setViewingItem(null); }}>
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

        {/* Services Excel-like Table */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>Services / Products ({ticketServices.length})</h3>
            {!isAddingService && (
              <button 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#3b82f6', color: 'white', padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 500, fontSize: '13px', cursor: 'pointer' }} 
                onClick={() => setIsAddingService(true)}
              >
                <Plus size={16} /> Add Service
              </button>
            )}
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'visible' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Product Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Vendor</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Serial Number</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Image</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Stage / Action</th>
                </tr>
              </thead>
              <tbody>
                {ticketServices.map((service, index) => (
                  <tr key={service.id} style={{ borderBottom: index < ticketServices.length - 1 || isAddingService ? '1px solid #e2e8f0' : 'none' }}>
                    <td style={{ padding: '16px', fontWeight: 500, color: '#0f172a' }}>{service.product}</td>
                    <td style={{ padding: '16px', color: '#475569' }}>{service.category}</td>
                    <td style={{ padding: '16px', color: '#475569' }}>{service.serviceVendor}</td>
                    <td style={{ padding: '16px', color: '#475569' }}>{service.serialNumber}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {service.inwardImageURL ? (
                        <button 
                          onClick={() => setPreviewImage(service.inwardImageURL)}
                          style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }}
                          title="View Original Image"
                        >
                          <Eye size={18} />
                        </button>
                      ) : (
                        <span style={{ color: '#cbd5e1' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span className={`status-badge ${service.statusClass}`} style={{ fontSize: '11px', padding: '4px 8px' }}>
                          {service.status}
                        </span>
                        
                        {userRole === 'ADMIN' ? (
                          service.status !== 'CUSTOMER OUTWARD' && service.status !== 'COMPLETED' ? (
                            <button
                              className="action-btn"
                              style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setAdvancingItem(service);
                                setAdvanceDate(getTodayDate());
                                setNewSerialNumber('');
                                setCourierCharge('');
                              }}
                              title="Click to advance status"
                            >
                              <ArrowRightCircle size={18} />
                            </button>
                          ) : (
                            <button
                              className="action-btn"
                              style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', padding: '4px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateReport(service);
                              }}
                              title="Generate Final Report & Send to WhatsApp"
                            >
                              <Share size={18} />
                            </button>
                          )
                        ) : (
                          <span title="Action restricted to admin" style={{color: '#cbd5e1'}}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Inline Editing Row (Excel-like) */}
                {isAddingService && (
                  <tr style={{ backgroundColor: '#f0fdf4' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <input 
                        type="text" 
                        placeholder="Enter Product..."
                        value={inlineData.productName}
                        onChange={e => setInlineData({...inlineData, productName: e.target.value})}
                        style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
                        autoFocus
                      />
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <SearchableDropdown
                        options={categories}
                        value={inlineData.category}
                        onChange={val => setInlineData({...inlineData, category: val})}
                        placeholder="Select Category"
                      />
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <SearchableDropdown
                        options={vendors}
                        value={inlineData.serviceVendor}
                        onChange={val => setInlineData({...inlineData, serviceVendor: val})}
                        placeholder="Select Vendor"
                      />
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <input 
                        type="text" 
                        placeholder="Serial # (Optional)"
                        value={inlineData.serialNumber}
                        onChange={e => setInlineData({...inlineData, serialNumber: e.target.value})}
                        style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
                      />
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', color: '#3b82f6', fontSize: '13px', fontWeight: 500 }}>
                          <Upload size={16} />
                          {inlineData.imageName ? (inlineData.imageName.length > 10 ? inlineData.imageName.substring(0, 10) + '...' : inlineData.imageName) : 'Upload'}
                          <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleInlineImageChange} />
                        </label>
                        {inlineData.image && (
                          <button 
                            onClick={() => setPreviewImage(inlineData.image)}
                            style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: '0', display: 'flex' }}
                            title="Preview Selected Image"
                          >
                            <Eye size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button 
                          onClick={handleSaveInline}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          <Save size={14} /> Save
                        </button>
                        <button 
                          onClick={() => setIsAddingService(false)}
                          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
