import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
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
  Loader2
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useTickets, useVendors } from './api/hooks';
import './index.css';
import './modal.css';
import './workflow.css';
import './advance-modal.css';
import './ledgers.css';
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
  const [courierCharge, setCourierCharge] = useState('');
  const [customMessage, setCustomMessage] = useState('');

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
      const newActivity = {
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


      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      axios.post(`${baseUrl}/tickets`, {
        rma: newRma,
        customerName: formData.customerName,
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
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        setIsModalOpen(false);
        setFormData({
          customerName: '',
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
      }).catch(err => {
        console.error("Failed to create ticket:", err);
        alert("Failed to create ticket");
      });
    };

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

  const confirmAdvanceStatus = () => {
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
    if (courierCharge) {
      updatedItem.courierCharge = courierCharge;
      updateData.courierCharge = courierCharge;
    }
    if (shippingImagePreview) {
      if (advancingItem.status === 'VENDOR OUTWARD') {
        updatedItem.outwardImageURL = shippingImagePreview;
        updateData.outwardImageURL = shippingImagePreview;
      } else if (advancingItem.status === 'VENDOR INWARD') {
        updatedItem.vendorInwardImageURL = shippingImagePreview;
        updateData.vendorInwardImageURL = shippingImagePreview;
      }
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
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
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      axios.post(`${baseUrl}/whatsapp/send-pdf`, { ticketData: itemToSend, message: customMessage })
        .then(res => console.log("WhatsApp PDF Sent:", res.data))
        .catch(err => console.error("Failed to send WhatsApp PDF:", err));

      const doc = new jsPDF();
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text("RMA Flow", 20, 22);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("CUSTOMER INWARD TICKET", 20, 32);
      doc.setFont("helvetica", "bold");
      doc.text(`TICKET #: ${itemToSend.rma}`, 140, 27);
      
      let yPos = 60;
      const drawField = (label, value, x, y) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 116, 139);
        doc.text(label.toUpperCase(), x, y);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        const textVal = value ? value.toString() : "N/A";
        const splitVal = doc.splitTextToSize(textVal, 80);
        doc.text(splitVal, x, y + 6);
        return splitVal.length * 6;
      };
      
      drawField("Customer Name", itemToSend.name, 20, yPos);
      drawField("Contact Number", itemToSend.contactNumber, 110, yPos);
      yPos += 20;
      drawField("Email Address", itemToSend.email, 20, yPos);
      drawField("Inward Date", itemToSend.date, 110, yPos);
      yPos += 20;
      doc.setDrawColor(226, 232, 240);
      doc.line(20, yPos, 190, yPos);
      yPos += 15;
      drawField("Product Model", itemToSend.product, 20, yPos);
      drawField("Category", itemToSend.category, 110, yPos);
      yPos += 20;
      drawField("Service Vendor", itemToSend.serviceVendor, 20, yPos);
      drawField("Serial Number", itemToSend.serialNumber, 110, yPos);
      yPos += 20;
      
      if (itemToSend.inwardImageURL) {
        try {
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(100, 116, 139);
          doc.text("ATTACHED IMAGE", 20, yPos);
          yPos += 5;
          doc.addImage(itemToSend.inwardImageURL, 'JPEG', 20, yPos, 100, 100, undefined, 'FAST');
        } catch(e) {
          console.error("Failed to add image to PDF", e);
        }
      }
      doc.save(`${itemToSend.rma}_Inward_Ticket.pdf`);
    } else if (advancingItem.status === 'VENDOR INWARD') {
      // Send text message to the vendor
      const vendorObj = vendors.find(v => v.companyName === advancingItem.serviceVendor);
      if (vendorObj && vendorObj.phoneNumber) {
        const vendorText = `*RMA Ticket Update*\nProduct: ${advancingItem.product}\nCustomer: ${advancingItem.name}\nCategory: ${advancingItem.category}\nOld Serial Number: ${advancingItem.serialNumber || 'N/A'}\nNew Serial Number: ${newSerialNumber || 'N/A'}\nCourier Charge: ${courierCharge || 'N/A'}\nTransition Date: ${formattedDate}`;
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        axios.post(`${baseUrl}/whatsapp/send-text`, { vendorPhone: vendorObj.phoneNumber, text: vendorText })
          .then(res => console.log("Vendor WhatsApp Text Sent:", res.data))
          .catch(err => console.error("Failed to send Vendor WhatsApp text:", err));
      } else {
        console.warn("Vendor phone number not found for:", advancingItem.serviceVendor);
      }
    }

    setAdvancingItem(null);
    setShippingImagePreview(null);
  };

  const handleGenerateReport = (item) => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("RMA Flow", 20, 22);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("FINAL REPORT", 20, 32);
    doc.setFont("helvetica", "bold");
    doc.text(`TICKET #: ${item.rma}`, 140, 27);
    
    let yPos = 60;
    const drawField = (label, value, x, y) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text(label.toUpperCase(), x, y);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      const textVal = value ? value.toString() : "N/A";
      const splitVal = doc.splitTextToSize(textVal, 80);
      doc.text(splitVal, x, y + 6);
      return splitVal.length * 6;
    };
    
    drawField("Customer Name", item.name, 20, yPos);
    drawField("Contact Number", item.contactNumber, 110, yPos);
    yPos += 20;
    drawField("Email Address", item.email, 20, yPos);
    drawField("Completion Date", item.date, 110, yPos);
    yPos += 20;
    doc.setDrawColor(226, 232, 240);
    doc.line(20, yPos, 190, yPos);
    yPos += 15;
    drawField("Product Model", item.product, 20, yPos);
    drawField("Category", item.category, 110, yPos);
    yPos += 20;
    drawField("Service Vendor", item.serviceVendor, 20, yPos);
    yPos += 20;
    drawField("Original Serial #", item.oldSerialNumber || item.serialNumber, 20, yPos);
    drawField("New Replacement Serial #", item.serialNumber, 110, yPos);
    yPos += 30;

    if (item.inwardImageURL) {
      try {
        if (yPos > 200) { doc.addPage(); yPos = 20; }
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 116, 139);
        doc.text("CUSTOMER INWARD IMAGE", 20, yPos);
        yPos += 5;
        doc.addImage(item.inwardImageURL, 'JPEG', 20, yPos, 100, 100, undefined, 'FAST');
        yPos += 110;
      } catch(e) {
        console.error("Failed to add image to PDF", e);
      }
    }
    
    if (item.outwardImageURL) {
      try {
        if (yPos > 200) { doc.addPage(); yPos = 20; }
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 116, 139);
        doc.text("SHIPPING SLIP IMAGE", 20, yPos);
        yPos += 5;
        doc.addImage(item.outwardImageURL, 'JPEG', 20, yPos, 100, 100, undefined, 'FAST');
        yPos += 110;
      } catch(e) {
        console.error("Failed to add image to PDF", e);
      }
    }

    if (item.vendorInwardImageURL) {
      try {
        if (yPos > 200) { doc.addPage(); yPos = 20; }
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 116, 139);
        doc.text("REPLACEMENT PRODUCT IMAGE", 20, yPos);
        yPos += 5;
        doc.addImage(item.vendorInwardImageURL, 'JPEG', 20, yPos, 100, 100, undefined, 'FAST');
        yPos += 110;
      } catch(e) {
        console.error("Failed to add image to PDF", e);
      }
    }
    
    window.open(doc.output('bloburl'), '_blank');
    doc.save(`${item.rma}_Final_Report.pdf`);

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    
    // Mark as completed
    axios.put(`${baseUrl}/tickets/${item.id}/status`, { status: 'COMPLETED', date: getTodayDate() })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        // After successfully marking completed, send WhatsApp to customer
        const payloadItem = { ...item, customerName: item.name };
        axios.post(`${baseUrl}/whatsapp/send-pdf`, { 
          ticketData: payloadItem, 
          message: `Hello ${item.name}, your RMA ticket (${item.rma}) has been completed. Please find your final replacement report attached.` 
        })
          .then(res => console.log("Final Report WhatsApp Sent:", res.data))
          .catch(err => console.error("Failed to send WhatsApp Final Report:", err));
      })
      .catch(err => console.error("Failed to mark completed:", err));
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
    const email = e.target[0].value;
    const password = e.target[1].value;
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
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
              <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', border: '1px solid #f87171' }}>
                {loginError}
              </div>
            )}
            <div className="login-input-group">
              <label>Email Address</label>
              <input type="email" className="login-input" placeholder="admin@rmaflow.com" required defaultValue="admin@rmaflow.com" />
            </div>

            <div className="login-input-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="login-input" 
                  placeholder="••••••••" 
                  required 
                  defaultValue="admin123" 
                  style={{ paddingRight: '40px' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={isLoggingIn} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              {isLoggingIn ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">

      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="brand">
          <div className="brand-logo">R</div>
          <span className="brand-title">RMA Flow</span>
        </div>
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} color="white" />
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
          <span className="brand-title">RMA Flow</span>
        </div>

        <div className="nav-menu">
          <div
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabChange('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>
          <div
            className={`nav-item ${activeTab === 'workflow' ? 'active' : ''}`}
            onClick={() => handleTabChange('workflow')}
          >
            <Workflow size={20} />
            <span>Workflow</span>
          </div>

          <div
            className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => handleTabChange('categories')}
          >
            <Package size={20} />
            <span>Categories</span>
          </div>
          <div
            className={`nav-item ${activeTab === 'vendors' ? 'active' : ''}`}
            onClick={() => handleTabChange('vendors')}
          >
            <Building2 size={20} />
            <span>Vendors</span>
          </div>
          <div
            className={`nav-item ${activeTab === 'print' ? 'active' : ''}`}
            onClick={() => handleTabChange('print')}
          >
            <Printer size={20} />
            <span>Reports</span>
          </div>
          {userRole === 'ADMIN' && (
            <div
              className={`nav-item ${activeTab === 'whatsapp' ? 'active' : ''}`}
              onClick={() => handleTabChange('whatsapp')}
            >
              <Smartphone size={20} />
              <span>WhatsApp Setup</span>
            </div>
          )}
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
          <Plus size={20} />
          <span>New Inward</span>
        </button>

        <div className="logout-btn-container">
          <button className="logout-btn" onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            delete axios.defaults.headers.common['Authorization'];
            setIsLoggedIn(false);
          }}>
            <LogOut size={20} />
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
              setAdvancingItem={setAdvancingItem}
              setAdvanceDate={setAdvanceDate}
              setNewSerialNumber={setNewSerialNumber}
              setCourierCharge={setCourierCharge}
              getTodayDate={getTodayDate}
              handleGenerateReport={handleGenerateReport}
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

      {/* Modals */}
      {isModalOpen && (
        <NewInwardModal
          setIsModalOpen={setIsModalOpen}
          formData={formData}
          setFormData={setFormData}
          handleInputChange={handleInputChange}
          handleSaveInward={handleSaveInward}
        />
      )}

      <TicketDetailsModal
        viewingItem={viewingItem}
        setViewingItem={setViewingItem}
        setAdvancingItem={setAdvancingItem}
        setAdvanceDate={setAdvanceDate}
        setNewSerialNumber={setNewSerialNumber}
        setCourierCharge={setCourierCharge}
        getTodayDate={getTodayDate}
        handleGenerateReport={handleGenerateReport}
        userRole={userRole}
      />

      <AdvanceWorkflowModal
        advancingItem={advancingItem}
        setAdvancingItem={setAdvancingItem}
        shippingImagePreview={shippingImagePreview}
        setShippingImagePreview={setShippingImagePreview}
        advanceDate={advanceDate}
        setAdvanceDate={setAdvanceDate}
        newSerialNumber={newSerialNumber}
        setNewSerialNumber={setNewSerialNumber}
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
