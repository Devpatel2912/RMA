import React, { useState } from 'react';
import { Search, ArrowRightCircle, Share, Eye, Printer, Loader2 } from 'lucide-react';
import { useTickets } from '../api/hooks';
import { SkeletonLoader } from './Spinner';

export default function WorkflowTab({
  setAdvancingItem, setAdvanceDate, setNewSerialNumber, setCourierCharge,
  getTodayDate, handleGenerateReport, generatingReportId, setViewingItem, userRole
}) {
  const { data: recentActivities = [], isLoading } = useTickets();

  const [workflowFilter, setWorkflowFilter] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredWorkflowItems = recentActivities.filter(item => {
    const matchesFilter = workflowFilter === 'All Items' || item.status === workflowFilter.toUpperCase();
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rma.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.serialNumber && item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      
    let matchesMonth = true;
    let matchesYear = true;
    
    if (item.date) {
      const [day, month, year] = item.date.split('/');
      if (filterMonth !== 'All' && filterMonth !== month) matchesMonth = false;
      if (filterYear !== 'All' && filterYear !== year) matchesYear = false;
    } else {
      if (filterMonth !== 'All' || filterYear !== 'All') {
        matchesMonth = false;
        matchesYear = false;
      }
    }

    return matchesFilter && matchesSearch && matchesMonth && matchesYear;
  });

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [workflowFilter, searchQuery, filterMonth, filterYear]);

  const groupedWorkflowItems = React.useMemo(() => {
    const groups = filteredWorkflowItems.reduce((acc, item) => {
      if (!acc[item.rma]) acc[item.rma] = { mainItem: item, services: [] };
      acc[item.rma].services.push(item);
      return acc;
    }, {});
    return Object.values(groups);
  }, [filteredWorkflowItems]);

  const totalPages = Math.max(1, Math.ceil(groupedWorkflowItems.length / itemsPerPage));
  const paginatedGroups = groupedWorkflowItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) {
    return <SkeletonLoader rows={7} />;
  }

  return (
    <>
      <div className="workflow-header">
        <div className="header-text">
          <h1 className="page-title">Replacement Workflow</h1>
        </div>

        <div className="workflow-controls">
          <select
            className="filter-dropdown"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            style={{ width: '120px' }}
          >
            <option value="All">All Months</option>
            {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => (
              <option key={m} value={m}>{new Date(2000, parseInt(m) - 1, 1).toLocaleString('default', { month: 'short' })}</option>
            ))}
          </select>
          <select
            className="filter-dropdown"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            style={{ width: '100px' }}
          >
            <option value="All">All Years</option>
            {Array.from(new Set(recentActivities.map(a => a.date?.split('/')[2]).filter(Boolean))).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            className="filter-dropdown"
            value={workflowFilter}
            onChange={(e) => setWorkflowFilter(e.target.value)}
          >
            {['All Items', 'Customer Inward', 'Vendor Outward', 'Vendor Inward', 'Customer Outward', 'Completed'].map(tab => (
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
            {paginatedGroups.map((group) => {
              const { mainItem, services } = group;
              const hasMultiple = services.length > 1;
              return (
              <tr
                className="workflow-tr"
                key={mainItem.rma}
                style={{ cursor: 'pointer' }}
                onClick={() => setViewingItem(mainItem)}
              >
                <td className="workflow-td ticket-id">
                  <span
                    style={{ color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
                    onClick={(e) => { e.stopPropagation(); setViewingItem(mainItem); }}
                  >
                    {mainItem.rma}
                  </span>
                </td>
                <td className="workflow-td">
                  <span className="table-cell-main">{mainItem.name}</span>
                  <span className="table-cell-sub">{mainItem.contactNumber}</span>
                </td>
                <td className="workflow-td">
                  <span className="table-cell-main">
                    {mainItem.product.length > 25 ? mainItem.product.substring(0, 25) + '...' : mainItem.product}
                  </span>
                  <span className="table-cell-sub">
                    {mainItem.category} • {mainItem.serviceVendor}
                  </span>
                </td>
                <td className="workflow-td table-serial">
                  {mainItem.serialNumber}
                </td>
                <td className="workflow-td">
                  <span className={`status-badge ${mainItem.statusClass}`}>
                    {mainItem.status}
                  </span>
                </td>
                <td className="workflow-td" style={{ textAlign: 'center' }}>
                  {hasMultiple ? (
                    <button
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingItem(mainItem);
                      }}
                      title="View all services to advance"
                      style={{ color: '#64748b', backgroundColor: '#f1f5f9' }}
                    >
                      <Eye size={20} />
                    </button>
                  ) : (
                    userRole === 'ADMIN' ? (
                      mainItem.status !== 'CUSTOMER OUTWARD' && mainItem.status !== 'COMPLETED' ? (
                        <button
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAdvancingItem(mainItem);
                            setAdvanceDate(getTodayDate());
                            setNewSerialNumber('');
                            setCourierCharge('');
                          }}
                          title="Click to advance status"
                        >
                          <ArrowRightCircle size={20} />
                        </button>
                      ) : (
                        <button
                          className="action-btn"
                          style={{ color: generatingReportId === mainItem.id ? '#94a3b8' : '#059669', backgroundColor: generatingReportId === mainItem.id ? '#e2e8f0' : '#d1fae5', cursor: generatingReportId === mainItem.id ? 'not-allowed' : 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (generatingReportId !== mainItem.id) {
                              handleGenerateReport(mainItem);
                            }
                          }}
                          disabled={generatingReportId === mainItem.id}
                          title={generatingReportId === mainItem.id ? "Generating Report..." : mainItem.status === 'COMPLETED' ? "Download Final Report" : "Complete Ticket & Send Final Report to WhatsApp"}
                        >
                          {generatingReportId === mainItem.id ? <Loader2 size={20} className="spinner" /> : mainItem.status === 'COMPLETED' ? <Printer size={20} /> : <Share size={20} />}
                        </button>
                      )
                    ) : (
                      <span title="Action restricted to admin" style={{color: '#cbd5e1'}}>—</span>
                    )
                  )}
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: 'var(--surface)', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredWorkflowItems.length)} of {filteredWorkflowItems.length} items
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: currentPage === 1 ? '#f8fafc' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#cbd5e1' : 'var(--text-primary)' }}
          >
            Previous
          </button>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: currentPage === totalPages ? '#f8fafc' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: currentPage === totalPages ? '#cbd5e1' : 'var(--text-primary)' }}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
