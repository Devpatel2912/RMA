import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Workflow, 
  BookOpen, 
  Plus, 
  Download, 
  ClipboardList,
  Truck,
  Package,
  UserCheck,
  History,
  X,
  Search,
  ArrowRightCircle,
  User,
  Building2,
  LogOut
} from 'lucide-react';
import './index.css';
import './modal.css';
import './workflow.css';
import './advance-modal.css';
import './ledgers.css';
import './login.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [advancingItem, setAdvancingItem] = useState(null);
  const [workflowFilter, setWorkflowFilter] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    contactNumber: '',
    productName: '',
    category: 'Motherboard',
    serviceVendor: 'ASUS Service',
    serialNumber: '',
    description: ''
  });

  const [recentActivities, setRecentActivities] = useState([
    {
      id: "84",
      name: "Alex Rivers",
      contactNumber: "+1 555-0123",
      product: "ROG Strix Z790-E Gaming WiFi",
      category: "Motherboard",
      serviceVendor: "ASUS Service",
      serialNumber: "SN982341829",
      rma: "RMA-842109",
      status: "CUSTOMER INWARD",
      date: "01/06/2026",
      statusClass: "bg-blue-light"
    },
    {
      id: "12",
      name: "Sarah Jenkins",
      contactNumber: "+1 555-4567",
      product: "GeForce RTX 4080 Suprim X",
      category: "GPU",
      serviceVendor: "MSI Support",
      serialNumber: "SN123908475",
      rma: "RMA-129485",
      status: "VENDOR OUTWARD",
      date: "31/05/2026",
      statusClass: "bg-yellow-light"
    },
    {
      id: "77",
      name: "Michael Chen",
      contactNumber: "+1 555-8901",
      product: "990 Pro 2TB NVMe SSD",
      category: "Storage",
      serviceVendor: "Samsung",
      serialNumber: "SN456123789",
      rma: "RMA-772103",
      status: "VENDOR INWARD",
      date: "31/05/2026",
      statusClass: "bg-purple-light"
    },
    {
      id: "33",
      name: "David Miller",
      contactNumber: "+1 555-2345",
      product: "RM850x 80 PLUS Gold PSU",
      category: "PSU",
      serviceVendor: "Corsair",
      serialNumber: "SN789456123",
      rma: "RMA-331092",
      status: "CUSTOMER OUTWARD",
      date: "31/05/2026",
      statusClass: "bg-green-light"
    }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveInward = () => {
    if (!formData.customerName || !formData.productName) return;

    const newId = Math.floor(Math.random() * 100).toString();
    const newRma = `RMA-${Math.floor(100000 + Math.random() * 900000)}`;
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

    const newActivity = {
      id: newId,
      name: formData.customerName,
      contactNumber: formData.contactNumber || 'N/A',
      product: formData.productName,
      category: formData.category,
      serviceVendor: formData.serviceVendor,
      serialNumber: formData.serialNumber || 'N/A',
      rma: newRma,
      status: "CUSTOMER INWARD",
      date: dateStr,
      statusClass: "bg-blue-light"
    };

    setRecentActivities([newActivity, ...recentActivities]);
    setIsModalOpen(false);
    setFormData({
      customerName: '',
      contactNumber: '',
      productName: '',
      category: 'Motherboard',
      serviceVendor: 'ASUS Service',
      serialNumber: '',
      description: ''
    });
  };

  const confirmAdvanceStatus = () => {
    if (!advancingItem) return;
    
    setRecentActivities(activities => activities.map(act => {
      if (act.id === advancingItem.id) {
        let newStatus, newClass;
        switch (act.status) {
          case 'CUSTOMER INWARD':
            newStatus = 'VENDOR OUTWARD';
            newClass = 'bg-yellow-light';
            break;
          case 'VENDOR OUTWARD':
            newStatus = 'VENDOR INWARD';
            newClass = 'bg-purple-light';
            break;
          case 'VENDOR INWARD':
            newStatus = 'CUSTOMER OUTWARD';
            newClass = 'bg-green-light';
            break;
          default:
            return act;
        }
        return { ...act, status: newStatus, statusClass: newClass };
      }
      return act;
    }));
    
    setAdvancingItem(null);
  };

  const handleExportData = () => {
    if (recentActivities.length === 0) return;

    const headers = ['Ticket Number', 'Customer Name', 'Contact Number', 'Product', 'Category', 'Service Vendor', 'Serial Number', 'Status', 'Date'];
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const item of recentActivities) {
      const row = [
        item.rma,
        `"${item.name}"`,
        `"${item.contactNumber}"`,
        `"${item.product}"`,
        item.category,
        item.serviceVendor,
        item.serialNumber,
        item.status,
        item.date
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rma_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-background-pattern"></div>
        <div className="login-box">
          <div className="login-header">
            <div className="login-logo">R</div>
            <div className="login-title-group">
              <h1 className="login-title">Welcome Back</h1>
              <p className="login-subtitle">Sign in to your RMA Flow account</p>
            </div>
          </div>
          
          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-input-group">
              <label>Email Address</label>
              <input type="email" className="login-input" placeholder="admin@rmaflow.com" required defaultValue="admin@rmaflow.com" />
            </div>
            
            <div className="login-input-group">
              <label>Password</label>
              <input type="password" className="login-input" placeholder="••••••••" required defaultValue="password" />
            </div>
            
            <button type="submit" className="login-btn">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  const filteredWorkflowItems = recentActivities.filter(item => {
    const matchesFilter = workflowFilter === 'All Items' || item.status === workflowFilter.toUpperCase();
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.rma.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="brand">
          <div className="brand-logo">R</div>
          <div className="brand-text">
            <span className="brand-title">RMA Flow</span>
            <span className="brand-subtitle">Professional Edition</span>
          </div>
        </div>

        <div className="nav-menu">
          <div 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'workflow' ? 'active' : ''}`}
            onClick={() => setActiveTab('workflow')}
          >
            <Workflow size={20} />
            <span>Workflow</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'ledgers' ? 'active' : ''}`}
            onClick={() => setActiveTab('ledgers')}
          >
            <BookOpen size={20} />
            <span>Ledgers</span>
          </div>
        </div>

        <button className="new-inward-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          <span>New Inward</span>
        </button>

        <div className="logout-btn-container">
          <button className="logout-btn" onClick={() => setIsLoggedIn(false)}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Main Content Scrollable Area */}
        <div className="main-content">
          
          {activeTab === 'dashboard' && (
            <>
              <div className="header">
                <div className="header-text">
                  <h1 className="page-title">Operational Overview</h1>
                  <p className="page-subtitle">Real-time metrics of your replacement cycle.</p>
                </div>
                <button className="export-btn" onClick={handleExportData}>
                  <Download size={16} />
                  Export Data
                </button>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-info">
                    <span className="stat-label">Received</span>
                    <span className="stat-value">{recentActivities.filter(a => a.status === 'CUSTOMER INWARD').length}</span>
                    <div className="stat-indicator" style={{ backgroundColor: 'var(--color-received)' }}></div>
                  </div>
                  <div className="stat-icon" style={{ color: 'var(--color-received)' }}>
                    <ClipboardList size={48} />
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-info">
                    <span className="stat-label">Wait Vendor Out</span>
                    <span className="stat-value">{recentActivities.filter(a => a.status === 'VENDOR OUTWARD').length}</span>
                    <div className="stat-indicator" style={{ backgroundColor: 'var(--color-vendor-out)' }}></div>
                  </div>
                  <div className="stat-icon" style={{ color: 'var(--color-vendor-out)' }}>
                    <Truck size={48} />
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-info">
                    <span className="stat-label">At Vendor</span>
                    <span className="stat-value">{recentActivities.filter(a => a.status === 'VENDOR INWARD').length}</span>
                    <div className="stat-indicator" style={{ backgroundColor: 'var(--color-vendor-in)' }}></div>
                  </div>
                  <div className="stat-icon" style={{ color: 'var(--color-vendor-in)' }}>
                    <Package size={48} />
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-info">
                    <span className="stat-label">Ready For Customer</span>
                    <span className="stat-value">{recentActivities.filter(a => a.status === 'CUSTOMER OUTWARD').length}</span>
                    <div className="stat-indicator" style={{ backgroundColor: 'var(--color-customer-out)' }}></div>
                  </div>
                  <div className="stat-icon" style={{ color: 'var(--color-customer-out)' }}>
                    <UserCheck size={48} />
                  </div>
                </div>
              </div>

              <div className="activity-section">
                <div className="section-header">
                  <History size={18} color="var(--primary-blue)" />
                  <span>Recent Activity</span>
                </div>

                <div className="activity-list">
                  {recentActivities.map((activity, index) => (
                    <div className="activity-item" key={index}>
                      <div className={`activity-id-box ${activity.statusClass}`} style={{ backgroundColor: 'transparent' }}>
                        <div style={{ backgroundColor: 'currentColor', opacity: 0.1, position: 'absolute', inset: 0, borderRadius: '8px' }}></div>
                        <span style={{ position: 'relative', zIndex: 1, color: 'inherit' }}>{activity.id}</span>
                      </div>
                      
                      <div className="activity-details">
                        <span className="activity-name">{activity.name}</span>
                        <span className="activity-product">{activity.product} • {activity.rma}</span>
                      </div>

                      <div className="activity-meta">
                        <span className={`status-badge ${activity.statusClass}`}>
                          {activity.status}
                        </span>
                        <span className="activity-date">{activity.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'workflow' && (
            <>
              <div className="workflow-header">
                <div className="header-text">
                  <h1 className="page-title">Replacement Workflow</h1>
                  <p className="page-subtitle">
                    Double-click the <ArrowRightCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', color: 'var(--primary-blue)' }} /> icon to advance status.
                  </p>
                </div>
                
                <div className="workflow-controls">
                  <select 
                    className="filter-dropdown"
                    value={workflowFilter}
                    onChange={(e) => setWorkflowFilter(e.target.value)}
                  >
                    {['All Items', 'Customer Inward', 'Vendor Outward', 'Vendor Inward', 'Customer Outward'].map(tab => (
                      <option key={tab} value={tab}>{tab}</option>
                    ))}
                  </select>
                  
                  <div className="search-box">
                    <Search size={16} color="#94a3b8" />
                    <input 
                      type="text" 
                      className="search-input" 
                      placeholder="Quick search..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="workflow-table-container">
                <table className="workflow-table">
                  <thead>
                    <tr>
                      <th className="workflow-th">TICKET #</th>
                      <th className="workflow-th">CUSTOMER</th>
                      <th className="workflow-th">PRODUCT</th>
                      <th className="workflow-th">SERIAL</th>
                      <th className="workflow-th">STAGE</th>
                      <th className="workflow-th" style={{ textAlign: 'center' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkflowItems.map((item) => (
                      <tr className="workflow-tr" key={item.id}>
                        <td className="workflow-td ticket-id">{item.rma}</td>
                        <td className="workflow-td">
                          <span className="table-cell-main">{item.name}</span>
                          <span className="table-cell-sub">{item.contactNumber}</span>
                        </td>
                        <td className="workflow-td">
                          <span className="table-cell-main">{item.product.length > 25 ? item.product.substring(0, 25) + '...' : item.product}</span>
                          <span className="table-cell-sub">{item.category} • {item.serviceVendor}</span>
                        </td>
                        <td className="workflow-td table-serial">{item.serialNumber}</td>
                        <td className="workflow-td">
                          <span className={`status-badge ${item.statusClass}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="workflow-td" style={{ textAlign: 'center' }}>
                          {item.status !== 'CUSTOMER OUTWARD' && (
                            <button 
                              className="action-btn" 
                              onClick={() => setAdvancingItem(item)}
                              title="Click to advance status"
                            >
                              <ArrowRightCircle size={20} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'ledgers' && (
            <>
              <div className="header">
                <div className="header-text">
                  <h1 className="page-title">Transaction Ledgers</h1>
                  <p className="page-subtitle">Comprehensive history of every unit replacement.</p>
                </div>
              </div>

              <div className="ledgers-grid">
                {/* Customer History Column */}
                <div className="ledger-column">
                  <div className="ledger-column-header">
                    <User size={18} color="var(--primary-blue)" />
                    <span>Customer History</span>
                  </div>
                  
                  {recentActivities.map(item => (
                    <div className="customer-card" key={`cust-${item.id}`}>
                      <div className="card-header-row">
                        <div>
                          <span className="card-label">CUSTOMER</span>
                          <span className="card-title">{item.name}</span>
                        </div>
                        <span className="card-tag">{item.rma}</span>
                      </div>
                      
                      <div className="customer-dates-row">
                        <div className="date-group">
                          <span className="card-label">Inward Date</span>
                          <span className="date-value">{item.date}</span>
                        </div>
                        <div className="date-group">
                          <span className="card-label">Outward Date</span>
                          <span className={`date-value ${item.status === 'CUSTOMER OUTWARD' ? '' : 'pending'}`}>
                            {item.status === 'CUSTOMER OUTWARD' ? new Date().toLocaleDateString('en-GB') : 'Pending'}
                          </span>
                        </div>
                      </div>

                      <div className="progress-track">
                        <div className={`progress-segment ${item.status !== 'Pending' ? 'active' : ''}`}></div>
                        <div className={`progress-segment ${item.status === 'VENDOR OUTWARD' || item.status === 'VENDOR INWARD' || item.status === 'CUSTOMER OUTWARD' ? 'active' : ''}`}></div>
                        <div className={`progress-segment ${item.status === 'VENDOR INWARD' || item.status === 'CUSTOMER OUTWARD' ? 'active' : ''}`}></div>
                        <div className={`progress-segment ${item.status === 'CUSTOMER OUTWARD' ? 'active' : ''}`}></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vendor Log Column */}
                <div className="ledger-column">
                  <div className="ledger-column-header">
                    <Truck size={18} color="#a855f7" />
                    <span>Vendor Log</span>
                  </div>

                  {recentActivities.map(item => (
                    <div className="vendor-card" key={`vend-${item.id}`}>
                      <div className="card-header-row">
                        <div>
                          <span className="card-label">VENDOR</span>
                          <span className="card-title">{item.serviceVendor}</span>
                        </div>
                        <span className="card-tag">{item.product.length > 15 ? item.product.substring(0, 15) + '...' : item.product}</span>
                      </div>
                      
                      <div className="vendor-details-list">
                        <div className="vendor-detail-row">
                          <span className="vendor-detail-label">To Vendor:</span>
                          <span className="vendor-detail-value">
                            {item.status === 'CUSTOMER INWARD' ? '--' : item.date}
                          </span>
                        </div>
                        <div className="vendor-detail-row">
                          <span className="vendor-detail-label">From Vendor:</span>
                          <span className={`vendor-detail-value ${(item.status === 'CUSTOMER INWARD' || item.status === 'VENDOR OUTWARD') ? 'in-progress' : ''}`}>
                            {(item.status === 'CUSTOMER INWARD' || item.status === 'VENDOR OUTWARD') ? 'In Progress' : item.date}
                          </span>
                        </div>
                        <div className="vendor-detail-row">
                          <span className="vendor-detail-label">Final Serial:</span>
                          <span className="vendor-detail-value serial">
                            {item.status === 'CUSTOMER OUTWARD' ? `NEW-${item.serialNumber}` : item.serialNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer Status Bar */}
        <div className="status-bar">
          <div className="status-left">
            <div className="status-item">
              <div className="status-dot"></div>
              <span>System Ready</span>
            </div>
            <div className="status-divider"></div>
            <span>Total Records: {recentActivities.length}</span>
          </div>

          <div className="status-right">
            <span>Pending VO: {recentActivities.filter(a => a.status === 'VENDOR OUTWARD').length}</span>
            <span>Pending VI: {recentActivities.filter(a => a.status === 'VENDOR INWARD').length}</span>
            <span>Pending CO: {recentActivities.filter(a => a.status === 'CUSTOMER OUTWARD').length}</span>
            <div className="status-divider"></div>
            <span>Time: {new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
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
                  <label className="form-label">Contact Number</label>
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
                  <select 
                    className="form-select"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="Motherboard">Motherboard</option>
                    <option value="GPU">Graphics Card</option>
                    <option value="CPU">Processor</option>
                    <option value="PSU">Power Supply</option>
                    <option value="Storage">Storage</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Service Vendor</label>
                  <select 
                    className="form-select"
                    name="serviceVendor"
                    value={formData.serviceVendor}
                    onChange={handleInputChange}
                  >
                    <option value="ASUS Service">ASUS Service</option>
                    <option value="Gigabyte Care">Gigabyte Care</option>
                    <option value="MSI Support">MSI Support</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Corsair">Corsair</option>
                  </select>
                </div>
              </div>

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
      )}

      {/* Advance Workflow Modal */}
      {advancingItem && (
        <div className="modal-overlay" onClick={() => setAdvancingItem(null)}>
          <div className="modal-content advance-modal" onClick={e => e.stopPropagation()}>
            <div className="advance-modal-header">
              <h2 className="modal-title">Advance Workflow</h2>
              <p className="modal-subtitle">Moving <span style={{ fontWeight: 700, color: '#0f172a' }}>{advancingItem.rma}</span> to the next stage.</p>
            </div>
            
            <div className="advance-modal-body">
              <div className="current-state-box">
                <span className="current-state-label">CURRENT STATE</span>
                <span className="current-state-value">{advancingItem.status}</span>
              </div>
            </div>

            <div className="advance-modal-footer">
              <button className="btn-text-cancel" onClick={() => setAdvancingItem(null)}>Cancel</button>
              <button className="btn-confirm" onClick={confirmAdvanceStatus}>Confirm Transition</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
