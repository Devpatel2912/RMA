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
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './landing/LandingPage';
import LoginPage from './landing/LoginPage';
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
    images: [],
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
    if (!formData.customerName || !formData.contactNumber || !formData.productName || !formData.category || !formData.serviceVendor || !formData.description || !formData.inwardDate || !formData.images || formData.images.length === 0) {
      alert("Please fill out all required fields and add at least one image. Serial Number and Email are optional.");
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
        images: [],
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
    if (formData.images && formData.images.length > 0) {
      const uploadedImages = [];
      let loadedCount = 0;
      formData.images.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(event) {
          uploadedImages.push(event.target.result);
          loadedCount += 1;
          if (loadedCount === formData.images.length) {
            finalizeSave(JSON.stringify(uploadedImages));
          }
        };
        reader.readAsDataURL(file);
      });
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

  const renderDashboard = () => {
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
            images: [],
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
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing/login-admin" element={
        isLoggedIn ? <Navigate to="/admin-panel" /> : <LoginPage setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />
      } />
      <Route path="/admin-panel" element={
        isLoggedIn ? renderDashboard() : <Navigate to="/landing/login-admin" />
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
