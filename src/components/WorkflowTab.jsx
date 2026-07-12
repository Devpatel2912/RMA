import React, { useState } from 'react';
import { Search, ArrowRightCircle, Share, Eye, Printer, Loader2, SlidersHorizontal } from 'lucide-react';
import { useTickets } from '../api/hooks';
import { SkeletonLoader } from './Spinner';

export default function WorkflowTab({
  setAdvancingItem, setAdvanceDate, setNewSerialNumber, setDocketNumber, setCourierCharge,
  getTodayDate, handleGenerateReport, generatingReportId, setViewingItem, userRole
}) {
  const { data: recentActivities = [], isLoading } = useTickets();

  const [workflowFilter, setWorkflowFilter] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredWorkflowItems = recentActivities.filter(item => {
    const matchesFilter = workflowFilter === 'All Items' || item.status === workflowFilter.toUpperCase();
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rma.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.serialNumber && item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      
    let matchesMonth = true;
    let matchesYear = true;
    
    if (item.date) {
      let month = '';
      let year = '';
      if (item.date.includes('-')) {
        const parts = item.date.split('-');
        year = parts[0];
        month = parts[1];
      } else if (item.date.includes('/')) {
        const parts = item.date.split('/');
        month = parts[1];
        year = parts[2];
      }

      if (month) {
        const paddedMonth = month.padStart(2, '0');
        if (filterMonth !== 'All' && filterMonth !== paddedMonth) matchesMonth = false;
      } else {
        if (filterMonth !== 'All') matchesMonth = false;
      }

      if (year) {
        if (filterYear !== 'All' && filterYear !== year) matchesYear = false;
      } else {
        if (filterYear !== 'All') matchesYear = false;
      }
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

  const uniqueYears = Array.from(new Set(recentActivities.map(a => {
    if (!a.date) return null;
    if (a.date.includes('-')) return a.date.split('-')[0];
    if (a.date.includes('/')) return a.date.split('/')[2];
    return null;
  }).filter(Boolean)));

  return (
    <>
      {/* ── Header ── */}
      <div className="workflow-header">
        <div className="header-text">
          <h1 className="page-title">Replacement Workflow</h1>
          <p className="page-subtitle">Track and advance tickets through the RMA pipeline</p>
        </div>

        <div className="workflow-controls">
          <select
            className="filter-dropdown"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            style={{ minWidth: 110 }}
          >
            <option value="All">All Months</option>
            {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
              <option key={m} value={m}>{new Date(2000, parseInt(m) - 1, 1).toLocaleString('default', { month: 'short' })}</option>
            ))}
          </select>

          <select
            className="filter-dropdown"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            style={{ minWidth: 90 }}
          >
            <option value="All">All Years</option>
            {uniqueYears.map(y => (
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
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              className="search-input"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="workflow-table-container" style={{ flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="workflow-table">
          <thead>
            <tr>
              <th className="workflow-th">Ticket #</th>
              <th className="workflow-th">Customer</th>
              <th className="workflow-th">Product</th>
              <th className="workflow-th">Serial</th>
              <th className="workflow-th">Stage</th>
              <th className="workflow-th" style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedGroups.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                  <Search size={28} style={{ marginBottom: 12, opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
                  <div style={{ fontSize: 14 }}>No tickets match the current filters.</div>
                </td>
              </tr>
            ) : (
              paginatedGroups.map((group) => {
                const { mainItem, services } = group;
                const hasMultiple = services.length > 1;
                return (
                  <tr
                    className="workflow-tr"
                    key={mainItem.rma}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setViewingItem(mainItem)}
                  >
                    <td className="workflow-td">
                      <span className="ticket-id">{mainItem.rma}</span>
                    </td>
                    <td className="workflow-td">
                      <span className="table-cell-main">{mainItem.name}</span>
                      <span className="table-cell-sub">{mainItem.contactNumber}</span>
                    </td>
                    <td className="workflow-td">
                      <span className="table-cell-main">
                        {mainItem.product.length > 26 ? mainItem.product.substring(0, 26) + '…' : mainItem.product}
                      </span>
                      <span className="table-cell-sub">
                        {mainItem.category} · {mainItem.serviceVendor}
                      </span>
                    </td>
                    <td className="workflow-td">
                      <span className="table-serial">{mainItem.serialNumber || '—'}</span>
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
                          title="View all services"
                          style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
                        >
                          <Eye size={17} />
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
                                if (setDocketNumber) setDocketNumber('');
                                setCourierCharge('');
                              }}
                              title="Advance to next stage"
                            >
                              <ArrowRightCircle size={17} />
                            </button>
                          ) : (
                            <button
                              className="action-btn"
                              style={{
                                color: generatingReportId === mainItem.id ? 'var(--text-muted)' : '#059669',
                                background: generatingReportId === mainItem.id ? 'var(--surface-hover)' : 'var(--success-light)',
                                cursor: generatingReportId === mainItem.id ? 'not-allowed' : 'pointer',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (generatingReportId !== mainItem.id) {
                                  handleGenerateReport(mainItem);
                                }
                              }}
                              disabled={generatingReportId === mainItem.id}
                              title={
                                generatingReportId === mainItem.id
                                  ? "Generating Report..."
                                  : mainItem.status === 'COMPLETED'
                                  ? "Download Final Report"
                                  : "Complete & Send Final Report"
                              }
                            >
                              {generatingReportId === mainItem.id
                                ? <Loader2 size={17} className="spinner" />
                                : mainItem.status === 'COMPLETED'
                                ? <Printer size={17} />
                                : <Share size={17} />
                              }
                            </button>
                          )
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>—</span>
                        )
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>

        {/* ── Pagination ── */}
        <div className="pagination-bar">
          <div className="pagination-info">
            {filteredWorkflowItems.length === 0
              ? 'No results'
              : `Showing ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, groupedWorkflowItems.length)} of ${groupedWorkflowItems.length} tickets`
            }
          </div>
          <div className="pagination-buttons">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              ← Previous
            </button>
            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
