import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import {
  LayoutDashboard,
  Workflow,
  BookOpen,
  Package,
  Plus,
  Building2,
  LogOut,
  Menu,
  Printer,
  Eye,
  EyeOff,
  Smartphone,
  Truck,
  Moon,
  Sun,
  X
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useTickets, useVendors } from './api/hooks';
import Spinner from './components/Spinner';
import './index.css';
import './modal.css';
import './workflow.css';
import './advance-modal.css';
import './ledgers.css';
import { generateTicketPDF } from './utils/pdfGenerator';
import './login.css';
import './mobile.css';

import DashboardTab from './components/DashboardTab';
import WorkflowTab from './components/WorkflowTab';

import ManageCategoriesTab from './components/ManageCategoriesTab';
import ManageVendorsTab from './components/ManageVendorsTab';
import NewInwardModal from './components/NewInwardModal';
import AdvanceWorkflowModal from './components/AdvanceWorkflowModal';
import TicketDetailsModal from './components/TicketDetailsModal';
import PrintReportsTab from './components/PrintReportsTab';
import WhatsAppSettings from './components/WhatsAppSettings';
import CourierChargesTab from './components/CourierChargesTab';

// Initialize Axios default token if available in localStorage
const initialToken = localStorage.getItem('token');
if (initialToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

function App() {
  const queryClient = useQueryClient();
  const { data: recentActivities = [] } = useTickets();
  const { data: vendors = [] } = useVendors();

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [advancingItem, setAdvancingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [shippingImagePreview, setShippingImagePreview] = useState(null);
  const [advanceDate, setAdvanceDate] = useState('');
  const [newSerialNumber, setNewSerialNumber] = useState('');
  const [docketNumber, setDocketNumber] = useState('');
  const [courierCharge, setCourierCharge] = useState('');
  
  const [vendorInwardImages, setVendorInwardImages] = useState([]);
  const [customMessage, setCustomMessage] = useState('');
  const [generatingReportId, setGeneratingReportId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }));
  
  // Theme state — persisted in localStorage
  const [theme, setTheme] = useState(() => localStorage.getItem('rma-theme') || 'light');

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rma-theme', theme);
  }, [theme]);

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    contactNumber: '',
    email: '',
    productName: '',
    category: '',
    serviceVendor: '',
    serialNumber: '',
    description: '',
    image: null,
    inwardDate: getTodayDate(),
    rma: null
  });

  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          delete axios.defaults.headers.common['Authorization'];
          setIsLoggedIn(false);
        }
        return Promise.reject(error);
      }
    );

    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsLoggedIn(true);
    }

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Barcode Scanner Global Listener
  useEffect(() => {
    let barcode = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e) => {
      const currentTime = Date.now();
      
      // If time between keystrokes is more than 50ms, consider it manual typing and reset
      if (currentTime - lastKeyTime > 50) {
        barcode = '';
      }

      // If Enter is pressed and we have a captured barcode string
      if (e.key === 'Enter' && barcode.length > 3) {
        if (isModalOpen) {
          setFormData(prev => ({ ...prev, serialNumber: barcode }));
        } else if (advancingItem && advancingItem.status === 'VENDOR INWARD') {
          setNewSerialNumber(barcode);
        }
        barcode = '';
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        barcode += e.key;
      }
      
      lastKeyTime = currentTime;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, advancingItem]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveInward = () => {
    if (!formData.customerName || !formData.contactNumber || !formData.productName || !formData.category || !formData.serviceVendor || !formData.description || !formData.inwardDate || !formData.image) {
      alert("Please fill out all required fields. Serial Number and Email are optional.");
      return;
    }

    const newId = Math.floor(Math.random() * 100).toString() + Date.now().toString().slice(-4);
    const newRma = formData.rma || `RMA-${Math.floor(100000 + Math.random() * 900000)}`;

    let dateStr = "";
    if (formData.inwardDate) {
      const [year, month, day] = formData.inwardDate.split('-');
      dateStr = `${day}/${month}/${year}`;
    } else {
      const today = new Date();
      dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    }

    const finalizeSave = (imgData = null) => {
      const optimisticTicket = {
        id: newId,
        name: formData.customerName,
        contactNumber: formData.contactNumber || 'N/A',
        product: formData.productName,
        category: formData.category,
        serviceVendor: formData.serviceVendor,
        serialNumber: formData.serialNumber || 'N/A',
        email: formData.email,
        rma: newRma,
        status: "CUSTOMER INWARD",
        date: dateStr,
        statusClass: "bg-blue-light",
        inwardImageURL: imgData
      };

      // Optimistically add ticket to the top of the list instantly
      const previousTickets = queryClient.getQueryData(['tickets']);
      queryClient.setQueryData(['tickets'], (old = []) => [optimisticTicket, ...old]);

      // Close modal and reset form immediately for snappy UX
      setIsModalOpen(false);
      setFormData({
        customerName: '',
        customerAddress: '',
        contactNumber: '',
        email: '',
        productName: '',
        category: 'Motherboard',
        serviceVendor: 'ASUS Service',
        serialNumber: '',
        description: '',
        image: null,
        inwardDate: getTodayDate(),
        rma: null
      });

      setIsSaving(false);

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
      axios.post(`${baseUrl}/tickets`, {
        rma: newRma,
        customerName: formData.customerName,
        customerAddress: formData.customerAddress,
        contactNumber: formData.contactNumber,
        email: formData.email,
        product: formData.productName,
        serialNumber: formData.serialNumber,
        status: "CUSTOMER INWARD",
        date: dateStr,
        description: formData.description,
        category: formData.category,
        serviceVendor: formData.serviceVendor,
        inwardImageURL: imgData
      }).then(() => {
        // Refresh from server to get real ID and server-side data
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
      }).catch(err => {
        console.error("Failed to create ticket:", err);
        // Rollback optimistic update
        queryClient.setQueryData(['tickets'], previousTickets);
        alert("Failed to save ticket. Please try again.");
      });
    };

    setIsSaving(true);
    if (formData.image) {
      const reader = new FileReader();
      reader.onload = function(event) {
        finalizeSave(event.target.result);
      };
      reader.readAsDataURL(formData.image);
    } else {
      finalizeSave(null);
    }
  };

  const handleOpenAdvanceModal = async (item) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
      const res = await axios.get(`${baseUrl}/tickets/${item.id}`);
      setAdvancingItem(res.data);
    } catch (err) {
      console.error("Failed to fetch full ticket details:", err);
      setAdvancingItem(item);
    }
  };

  const confirmAdvanceStatus = async () => {
    if (!advancingItem) return;

    let newStatus, newClass;
    switch (advancingItem.status) {
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
        return;
    }
    let formattedDate = advancingItem.date;
    if (advanceDate) {
      const [year, month, day] = advanceDate.split('-');
      formattedDate = `${day}/${month}/${year}`;
    }

    let updatedItem = { ...advancingItem, status: newStatus, statusClass: newClass, date: formattedDate };
    
    const updateData = {
      status: newStatus,
      date: formattedDate
    };

    if (newSerialNumber) {
      updatedItem.oldSerialNumber = advancingItem.serialNumber;
      updatedItem.serialNumber = newSerialNumber;
      updateData.serialNumber = newSerialNumber;
      updateData.oldSerialNumber = advancingItem.serialNumber;
    }
    if (docketNumber) {
      updatedItem.docketNumber = docketNumber;
      updateData.docketNumber = docketNumber;
    }
    if (courierCharge) {
      updatedItem.courierCharge = courierCharge;
      updateData.courierCharge = courierCharge;
    }
    if (advancingItem.status === 'VENDOR OUTWARD') {
      if (shippingImagePreview) {
        updatedItem.outwardImageURL = shippingImagePreview;
        updateData.outwardImageURL = shippingImagePreview;
      }
      updatedItem.docketNumber = docketNumber;
      updateData.docketNumber = docketNumber;
      updatedItem.courierCharge = courierCharge;
      updateData.courierCharge = courierCharge;
    } else if (advancingItem.status === 'VENDOR INWARD') {
      if (vendorInwardImages && vendorInwardImages.length > 0) {
        const imgsString = JSON.stringify(vendorInwardImages);
        updatedItem.vendorInwardImageURL = imgsString;
        updateData.vendorInwardImageURL = imgsString;
      }
    }


    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
    
    // Optimistic Update: instantly update the UI cache
    queryClient.setQueryData(['tickets'], (old) => {
      if (!old) return old;
      return old.map(t => t.id === advancingItem.id ? { ...t, ...updateData, statusClass: newClass } : t);
    });

    axios.put(`${baseUrl}/tickets/${advancingItem.id}/status`, updateData)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
      })
      .catch(err => {
        console.error("Failed to update status:", err);
      });

    // Generate PDF and send WhatsApp ONLY if transitioning FROM CUSTOMER INWARD
    if (advancingItem.status === 'CUSTOMER INWARD') {
      const itemToSend = updatedItem || advancingItem;
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';

      // 1. Send PDF to Vendor Only
      const vendorObj = vendors.find(v => v.companyName === advancingItem.serviceVendor);
      if (vendorObj && vendorObj.phoneNumber) {
        axios.post(`${baseUrl}/whatsapp/send-pdf`, { ticketData: itemToSend, message: customMessage, targetPhone: vendorObj.phoneNumber })
          .then(res => console.log("WhatsApp PDF Sent to Vendor:", res.data))
          .catch(err => {
            console.error("Failed to send WhatsApp PDF to Vendor:", err);
            alert("Vendor WhatsApp failed: " + (err.response?.data?.error || err.message));
          });
      } else {
        console.warn("Vendor phone number not found for PDF dispatch:", advancingItem.serviceVendor);
      }

      // The WhatsApp PDF is generated and sent by the backend.
      // We no longer auto-download the PDF on the frontend here.
    } else if (advancingItem.status === 'VENDOR INWARD') {
      // Transitioning to CUSTOMER OUTWARD -> Send Text to Customer Only
      const itemToSend = updatedItem || advancingItem;
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';

      const staticMsg = customMessage || `Hello ${itemToSend.name}, your RMA ticket (${itemToSend.rma}) is ready for dispatch from our vendor.`;

      // Send Text to Customer
      axios.post(`${baseUrl}/whatsapp/send-text`, { vendorPhone: itemToSend.contactNumber, text: staticMsg })
        .then(res => console.log("WhatsApp Text Sent to Customer:", res.data))
        .catch(err => {
          console.error("Failed to send WhatsApp Text to Customer:", err);
          alert("Customer WhatsApp failed: " + (err.response?.data?.error || err.message));
        });
    }

    setAdvancingItem(null);
    setShippingImagePreview(null);
  };

  const handleGenerateReport = async (item) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
    setGeneratingReportId(item.id);
    try {
      // Fetch the full ticket to get the images, as they are excluded from the main list for performance
      const res = await axios.get(`${baseUrl}/tickets/${item.id}`);
      const fullItem = res.data;
      
      // 1. Generate and download/print the highly-styled PDF using the full item
      generateTicketPDF('COMPLETED', fullItem);

      // 2. Only mark as completed and send WhatsApp if it's not already completed
      if (item.status !== 'COMPLETED') {
        // Optimistic update
        queryClient.setQueryData(['tickets'], (old) => {
          if (!old) return old;
          return old.map(t => t.id === item.id ? { ...t, status: 'COMPLETED', statusClass: 'bg-green-dark' } : t);
        });

        await axios.put(`${baseUrl}/tickets/${item.id}/status`, { status: 'COMPLETED', date: getTodayDate() });
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        
        // After successfully marking completed, send WhatsApp to customer
        const payloadItem = { ...fullItem, customerName: fullItem.name };
        try {
          const waRes = await axios.post(`${baseUrl}/whatsapp/send-pdf`, { 
            ticketData: payloadItem, 
            message: `Hello ${fullItem.name}, your RMA ticket (${fullItem.rma}) has been completed. Please find your final replacement report attached.` 
          });
          console.log("Final Report WhatsApp Sent:", waRes.data);
        } catch (err) {
          console.error("Failed to send WhatsApp Final Report:", err);
          alert("WhatsApp Final Report failed: " + (err.response?.data?.error || err.message));
        }
      }
    } catch (err) {
      console.error("Failed to process report:", err);
      alert("Failed to process report.");
    } finally {
      setGeneratingReportId(null);
    }
  };

  const handleSendWhatsAppReport = async (item, messageText) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
    setGeneratingReportId(item.id);
    try {
      const res = await axios.get(`${baseUrl}/tickets/${item.id}`);
      const fullItem = res.data;
      const staticMsg = messageText || `Hello ${fullItem.name}, your RMA ticket (${fullItem.rma}) has been completed. Please collect your product.`;

      await axios.post(`${baseUrl}/whatsapp/send-text`, {
        vendorPhone: fullItem.contactNumber,
        text: staticMsg
      });

      alert("WhatsApp message sent successfully.");
    } catch (err) {
      console.error("Failed to send WhatsApp message:", err);
      alert("WhatsApp message failed: " + (err.response?.data?.error || err.message));
      throw err;
    } finally {
      setGeneratingReportId(null);
    }
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false); // Close drawer on navigation
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
      const res = await axios.post(`${baseUrl}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userRole', res.data.user.role);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUserRole(res.data.user.role);
      setIsLoggedIn(true);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setLoginError(err.response.data.error);
      } else {
        setLoginError("Login failed. Please check your credentials.");
      }
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ── Login Page ─────────────────────────────────────────
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
            {loginError && (
              <div className="login-error">
                {loginError}
              </div>
            )}
            <div className="login-input-group">
              <label>Email Address</label>
              <input type="email" name="email" className="login-input" placeholder="admin@example.com" required />
            </div>

            <div className="login-input-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  className="login-input" 
                  placeholder="••••••••" 
                  required 
                  style={{ paddingRight: '44px' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={isLoggingIn} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              {isLoggingIn ? <Spinner size="sm" variant="white" /> : 'Sign In'}
            </button>
          </form>

          {/* Footer note */}
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#334155', marginTop: '-8px' }}>
            RMA Flow · Powered by Avxperts
          </p>
        </div>
      </div>
    );
  }

  // ── Main Layout ────────────────────────────────────────
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workflow', label: 'Workflow', icon: Workflow },
    { id: 'categories', label: 'Categories', icon: Package },
    { id: 'vendors', label: 'Vendors', icon: Building2 },
    { id: 'print', label: 'Reports', icon: Printer },
    ...(userRole === 'ADMIN' ? [{ id: 'whatsapp', label: 'WhatsApp Setup', icon: Smartphone }] : []),
    { id: 'courier-charges', label: 'Courier Charges', icon: Truck },
  ];

  return (
    <div className="layout">

      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="brand" style={{ margin: 0 }}>
          <div className="brand-logo">R</div>
          <span className="brand-title">RMA Flow</span>
        </div>
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={20} color="white" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="brand">
          <div className="brand-logo">R</div>
          <div>
            <div className="brand-title">RMA Flow</div>
            <div className="brand-subtitle">Service Management</div>
          </div>
        </div>

        <div className="nav-menu">
          {navItems.map(({ id, label, icon: Icon }) => (
            <div
              key={id}
              className={`nav-item ${activeTab === id ? 'active' : ''}`}
              onClick={() => handleTabChange(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </div>
          ))}
        </div>

        <button className="new-inward-btn" onClick={() => { 
          setFormData({
            customerName: '',
            contactNumber: '',
            email: '',
            productName: '',
            category: '',
            serviceVendor: '',
            serialNumber: '',
            description: '',
            image: null,
            inwardDate: getTodayDate(),
            rma: null
          });
          setIsModalOpen(true); 
          setIsMobileMenuOpen(false); 
        }}>
          <Plus size={18} />
          <span>New Inward</span>
        </button>

        <div className="logout-btn-container">


          {/* Logout */}
          <button className="logout-btn" onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            delete axios.defaults.headers.common['Authorization'];
            setIsLoggedIn(false);
          }}>
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-container">

        {/* Main Content Scrollable Area */}
        <div className="main-content">
          {activeTab === 'dashboard' && (
            <DashboardTab 
              handleExportData={handleExportData} 
              setViewingItem={setViewingItem} 
            />
          )}

          {activeTab === 'workflow' && (
            <WorkflowTab 
              recentActivities={recentActivities}
              setAdvancingItem={handleOpenAdvanceModal}
              setAdvanceDate={setAdvanceDate}
              setNewSerialNumber={setNewSerialNumber}
              setDocketNumber={setDocketNumber}
              setCourierCharge={setCourierCharge}
              getTodayDate={getTodayDate}
              handleGenerateReport={handleGenerateReport}
              generatingReportId={generatingReportId}
              setViewingItem={setViewingItem}
              userRole={userRole}
            />
          )}

          {activeTab === 'categories' && (
            <ManageCategoriesTab userRole={userRole} />
          )}

          {activeTab === 'vendors' && (
            <ManageVendorsTab userRole={userRole} />
          )}

          {activeTab === 'print' && (
            <PrintReportsTab recentActivities={recentActivities} />
          )}

          {activeTab === 'whatsapp' && (
            <WhatsAppSettings />
          )}

          {activeTab === 'courier-charges' && (
            <CourierChargesTab recentActivities={recentActivities} />
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
            <span>Total Records: <strong>{recentActivities.length}</strong></span>
          </div>

          <div className="status-right">
            <span>VO: <strong>{recentActivities.filter(a => a.status === 'VENDOR OUTWARD').length}</strong></span>
            <span>VI: <strong>{recentActivities.filter(a => a.status === 'VENDOR INWARD').length}</strong></span>
            <span>CO: <strong>{recentActivities.filter(a => a.status === 'CUSTOMER OUTWARD').length}</strong></span>
            <div className="status-divider"></div>
            <span>{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <NewInwardModal
          setIsModalOpen={setIsModalOpen}
          formData={formData}
          setFormData={setFormData}
          handleInputChange={handleInputChange}
          handleSaveInward={handleSaveInward}
          isSaving={isSaving}
        />
      )}

      <TicketDetailsModal
        viewingItem={viewingItem}
        setViewingItem={setViewingItem}
        setAdvancingItem={setAdvancingItem}
        setAdvanceDate={setAdvanceDate}
        setNewSerialNumber={setNewSerialNumber}
        setDocketNumber={setDocketNumber}
        setCourierCharge={setCourierCharge}
        getTodayDate={getTodayDate}
        handleGenerateReport={handleGenerateReport}
        handleSendWhatsAppReport={handleSendWhatsAppReport}
        userRole={userRole}
      />

      <AdvanceWorkflowModal
        advancingItem={advancingItem}
        setAdvancingItem={setAdvancingItem}
        shippingImagePreview={shippingImagePreview}
        setShippingImagePreview={setShippingImagePreview}
        vendorInwardImages={vendorInwardImages}
        setVendorInwardImages={setVendorInwardImages}
        advanceDate={advanceDate}
        setAdvanceDate={setAdvanceDate}
        newSerialNumber={newSerialNumber}
        setNewSerialNumber={setNewSerialNumber}
        docketNumber={docketNumber}
        setDocketNumber={setDocketNumber}
        courierCharge={courierCharge}
        setCourierCharge={setCourierCharge}
        customMessage={customMessage}
        setCustomMessage={setCustomMessage}
        confirmAdvanceStatus={confirmAdvanceStatus}
      />
    </div>
  );
}

export default App;
