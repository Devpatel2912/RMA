import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import {
  LayoutDashboard,
  Workflow,
  BookOpen,
  Package,
  Plus,
  Building2,
  LogOut,
  Menu
} from 'lucide-react';
import './index.css';
import './modal.css';
import './workflow.css';
import './advance-modal.css';
import './ledgers.css';
import './login.css';
import './mobile.css';

import DashboardTab from './components/DashboardTab';
import WorkflowTab from './components/WorkflowTab';
import LedgersTab from './components/LedgersTab';
import ManageCategoriesTab from './components/ManageCategoriesTab';
import ManageVendorsTab from './components/ManageVendorsTab';
import NewInwardModal from './components/NewInwardModal';
import AdvanceWorkflowModal from './components/AdvanceWorkflowModal';
import TicketDetailsModal from './components/TicketDetailsModal';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newVendorName, setNewVendorName] = useState('');
  const [advancingItem, setAdvancingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [shippingImagePreview, setShippingImagePreview] = useState(null);
  const [advanceDate, setAdvanceDate] = useState('');
  const [newSerialNumber, setNewSerialNumber] = useState('');
  const [courierCharge, setCourierCharge] = useState('');
  const [workflowFilter, setWorkflowFilter] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');

  const [categories, setCategories] = useState([
    'Motherboard',
    'GPU',
    'CPU',
    'PSU',
    'Storage'
  ]);

  const [vendors, setVendors] = useState([
    'ASUS Service',
    'Gigabyte Care',
    'MSI Support',
    'Samsung',
    'Corsair'
  ]);

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    contactNumber: '',
    email: '',
    productName: '',
    category: 'Motherboard',
    serviceVendor: 'ASUS Service',
    serialNumber: '',
    description: '',
    image: null,
    inwardDate: getTodayDate()
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
    if (!formData.customerName || !formData.contactNumber || !formData.productName || !formData.category || !formData.serviceVendor || !formData.serialNumber || !formData.description || !formData.inwardDate) {
      alert("Please fill out all required fields. Email and Image are optional.");
      return;
    }

    const newId = Math.floor(Math.random() * 100).toString();
    const newRma = `RMA-${Math.floor(100000 + Math.random() * 900000)}`;

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

      // Format WhatsApp Message
      let whatsappMessage = `*New RMA Inward Entry*\n\n`;
      whatsappMessage += `*Ticket #:* ${newRma}\n`;
      whatsappMessage += `*Customer Name:* ${formData.customerName}\n`;
      whatsappMessage += `*Contact:* ${formData.contactNumber}\n`;
      if (formData.email) whatsappMessage += `*Email:* ${formData.email}\n`;
      whatsappMessage += `*Product:* ${formData.productName}\n`;
      whatsappMessage += `*Category:* ${formData.category}\n`;
      whatsappMessage += `*Vendor:* ${formData.serviceVendor}\n`;
      if (formData.serialNumber) whatsappMessage += `*Serial #:* ${formData.serialNumber}\n`;
      if (formData.description) whatsappMessage += `*Description:* ${formData.description}\n`;
      whatsappMessage += `*Date:* ${dateStr}\n`;
      if (formData.image) whatsappMessage += `\n*Note:* Please manually attach the downloaded PDF.`;

      const triggerWhatsApp = () => {
        const phoneNum = formData.contactNumber.replace(/[\s\-\(\)\+]/g, '');
        if (phoneNum) {
          window.open(`https://wa.me/${phoneNum}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
        }
      };

      const doc = new jsPDF();
      
      // Header background
      doc.setFillColor(15, 23, 42); // #0f172a
      doc.rect(0, 0, 210, 40, 'F');
      
      // Header text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text("RMA Flow", 20, 22);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("CUSTOMER INWARD TICKET", 20, 32);

      doc.setFont("helvetica", "bold");
      doc.text(`TICKET #: ${newRma}`, 140, 27);
      
      let yPos = 60;
      
      const drawField = (label, value, x, y) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(label.toUpperCase(), x, y);
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42); // slate-900
        const textVal = value ? value.toString() : "N/A";
        const splitVal = doc.splitTextToSize(textVal, 80);
        doc.text(splitVal, x, y + 6);
        return splitVal.length * 6;
      };
      
      drawField("Customer Name", formData.customerName, 20, yPos);
      drawField("Contact Number", formData.contactNumber, 110, yPos);
      yPos += 20;

      drawField("Email Address", formData.email, 20, yPos);
      drawField("Inward Date", dateStr, 110, yPos);
      yPos += 20;

      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(20, yPos, 190, yPos);
      yPos += 15;

      drawField("Product Model", formData.productName, 20, yPos);
      drawField("Category", formData.category, 110, yPos);
      yPos += 20;

      drawField("Service Vendor", formData.serviceVendor, 20, yPos);
      drawField("Serial Number", formData.serialNumber, 110, yPos);
      yPos += 20;
      
      if (formData.description) {
        doc.line(20, yPos, 190, yPos);
        yPos += 15;
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 116, 139);
        doc.text("PROBLEM DESCRIPTION", 20, yPos);
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        const splitDesc = doc.splitTextToSize(formData.description, 170);
        doc.text(splitDesc, 20, yPos + 6);
        yPos += (splitDesc.length * 6) + 15;
      }

      if (imgData) {
        try {
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(100, 116, 139);
          doc.text("ATTACHED IMAGE", 20, yPos);
          yPos += 5;
          doc.addImage(imgData, 'JPEG', 20, yPos, 100, 100, undefined, 'FAST');
        } catch(e) {
          console.error("Failed to add image to PDF", e);
        }
      }
      
      doc.save(`${newRma}_Inward_Ticket.pdf`);
      triggerWhatsApp();

      setRecentActivities(prev => [newActivity, ...prev]);
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
        inwardDate: getTodayDate()
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
        let formattedDate = act.date;
        if (advanceDate) {
          const [year, month, day] = advanceDate.split('-');
          formattedDate = `${day}/${month}/${year}`;
        }
        let updatedItem = { ...act, status: newStatus, statusClass: newClass, date: formattedDate };
        if (newSerialNumber) {
          updatedItem.oldSerialNumber = act.serialNumber;
          updatedItem.serialNumber = newSerialNumber;
        }
        if (courierCharge) {
          updatedItem.courierCharge = courierCharge;
        }
        return updatedItem;
      }
      return act;
    }));

    setAdvancingItem(null);
    setShippingImagePreview(null);
  };

  const handleGenerateReport = (item) => {
    // Format WhatsApp Message
    let whatsappMessage = `*RMA Final Report*\n\n`;
    whatsappMessage += `*Ticket #:* ${item.rma}\n`;
    whatsappMessage += `*Customer Name:* ${item.name}\n`;
    whatsappMessage += `*Contact:* ${item.contactNumber}\n`;
    if (item.email) whatsappMessage += `*Email:* ${item.email}\n`;
    whatsappMessage += `*Product:* ${item.product}\n`;
    whatsappMessage += `*Category:* ${item.category}\n`;
    whatsappMessage += `*Vendor:* ${item.serviceVendor}\n`;
    whatsappMessage += `*Final Serial #:* ${item.serialNumber}\n`;
    if (item.oldSerialNumber) whatsappMessage += `*Old Serial #:* ${item.oldSerialNumber}\n`;
    if (item.courierCharge) whatsappMessage += `*Courier Charge:* ${item.courierCharge}\n`;
    whatsappMessage += `*Completion Date:* ${item.date}\n`;
    whatsappMessage += `\n*Note:* Please manually attach the downloaded PDF report.`;

    const phoneNum = item.contactNumber.replace(/[\s\-\(\)\+]/g, '');
    if (phoneNum) {
      window.open(`https://wa.me/${phoneNum}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
    }

    const doc = new jsPDF();
    
    // Header background
    doc.setFillColor(15, 23, 42); // #0f172a
    doc.rect(0, 0, 210, 40, 'F');
    
    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("RMA Flow", 20, 22);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("FINAL RESOLUTION TICKET", 20, 32);

    doc.setFont("helvetica", "bold");
    doc.text(`TICKET #: ${item.rma}`, 140, 27);
    
    let yPos = 60;
    
    const drawField = (label, value, x, y) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(label.toUpperCase(), x, y);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42); // slate-900
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
    
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(20, yPos, 190, yPos);
    yPos += 15;

    drawField("Product Model", item.product, 20, yPos);
    drawField("Category", item.category, 110, yPos);
    yPos += 20;

    drawField("Service Vendor", item.serviceVendor, 20, yPos);
    drawField("Courier Charge", item.courierCharge, 110, yPos);
    yPos += 20;

    doc.line(20, yPos, 190, yPos);
    yPos += 15;
    
    drawField("Original Serial #", item.oldSerialNumber || item.serialNumber, 20, yPos);
    drawField("New Replacement Serial #", item.serialNumber, 110, yPos);
    yPos += 30;

    if (item.inwardImageURL) {
      try {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 116, 139);
        doc.text("INWARD IMAGE", 20, yPos);
        yPos += 5;
        doc.addImage(item.inwardImageURL, 'JPEG', 20, yPos, 100, 100, undefined, 'FAST');
      } catch(e) {
        console.error("Failed to add image to PDF", e);
      }
    }
    
    doc.save(`${item.rma}_Final_Report.pdf`);

    setRecentActivities(activities => activities.map(act => {
      if (act.id === item.id) {
        return { ...act, status: 'COMPLETED' };
      }
      return act;
    }));
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
            className={`nav-item ${activeTab === 'ledgers' ? 'active' : ''}`}
            onClick={() => handleTabChange('ledgers')}
          >
            <BookOpen size={20} />
            <span>Ledgers</span>
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
        </div>

        <button className="new-inward-btn" onClick={() => { setIsModalOpen(true); setIsMobileMenuOpen(false); }}>
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
      <div className="main-container">

        {/* Main Content Scrollable Area */}
        <div className="main-content">
          {activeTab === 'dashboard' && (
            <DashboardTab 
              recentActivities={recentActivities} 
              handleExportData={handleExportData} 
              setViewingItem={setViewingItem} 
            />
          )}

          {activeTab === 'workflow' && (
            <WorkflowTab 
              workflowFilter={workflowFilter}
              setWorkflowFilter={setWorkflowFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredWorkflowItems={filteredWorkflowItems}
              setAdvancingItem={setAdvancingItem}
              setAdvanceDate={setAdvanceDate}
              setNewSerialNumber={setNewSerialNumber}
              setCourierCharge={setCourierCharge}
              getTodayDate={getTodayDate}
              handleGenerateReport={handleGenerateReport}
              setViewingItem={setViewingItem}
            />
          )}

          {activeTab === 'ledgers' && (
            <LedgersTab 
              recentActivities={recentActivities}
              setViewingItem={setViewingItem}
            />
          )}

          {activeTab === 'categories' && (
            <ManageCategoriesTab 
              categories={categories}
              setCategories={setCategories}
              newCategoryName={newCategoryName}
              setNewCategoryName={setNewCategoryName}
            />
          )}

          {activeTab === 'vendors' && (
            <ManageVendorsTab 
              vendors={vendors}
              setVendors={setVendors}
              newVendorName={newVendorName}
              setNewVendorName={setNewVendorName}
            />
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
          categories={categories}
          vendors={vendors}
          handleSaveInward={handleSaveInward}
        />
      )}

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
        confirmAdvanceStatus={confirmAdvanceStatus}
      />

      <TicketDetailsModal
        viewingItem={viewingItem}
        setViewingItem={setViewingItem}
      />
    </div>
  );
}

export default App;
