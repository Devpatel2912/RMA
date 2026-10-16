import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowRightCircle, Share, Eye, Printer, Loader2, SlidersHorizontal, Trash2, ClipboardList, Package, Truck, UserCheck } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
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
  const [isAdvancingId, setIsAdvancingId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTickets(paginatedGroups.map(g => g.mainItem.id));
    } else {
      setSelectedTickets([]);
    }
  };

  const handleSelectTicket = (id) => {
    setSelectedTickets(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedTickets.length} ticket(s)?`)) return;
    setIsDeleting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
      const results = await Promise.allSettled(selectedTickets.map(id => axios.delete(`${baseUrl}/tickets/${id}`)));

      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        console.error('Some tickets failed to delete:', failed);
        alert(`Finished deletion process. ${failed.length} out of ${results.length} ticket(s) could not be deleted.`);
      }
    } catch (error) {
      console.error('Unexpected error during deletion:', error);
    } finally {
      setSelectedTickets([]);
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setIsDeleting(false);
    }
  };

  const handleNativeShare = async (ticket) => {
    if (navigator.share) {
      try {
        let filesArray = [];
        
        if (ticket.outwardImageURL) {
          let images = [];
          try {
            images = JSON.parse(ticket.outwardImageURL);
            if (!Array.isArray(images)) images = [ticket.outwardImageURL];
          } catch (e) {
            images = [ticket.outwardImageURL];
          }
          
          if (images.length > 0) {
            const compressImageTo200KB = async (dataUrl, index) => {
              return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                
                const isBase64 = dataUrl.startsWith('data:');
                if (!isBase64 && !dataUrl.startsWith('http')) {
                  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
                  const rootUrl = baseUrl.replace(/\/api$/, '');
                  const normalizedPath = dataUrl.replace(/\\/g, '/');
                  dataUrl = `${rootUrl}/${normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath}`;
                }
                
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  let width = img.width;
                  let height = img.height;

                  const MAX_WIDTH = 1200;
                  const MAX_HEIGHT = 1200;
                  if (width > height && width > MAX_WIDTH) {
                    height = Math.round(height * MAX_WIDTH / width);
                    width = MAX_WIDTH;
                  } else if (height > MAX_HEIGHT) {
                    width = Math.round(width * MAX_HEIGHT / height);
                    height = MAX_HEIGHT;
                  }

                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0, width, height);

                  let quality = 0.9;
                  const targetSize = 200 * 1024; // 200KB

                  const compress = () => {
                    canvas.toBlob((blob) => {
                      if (!blob) return reject(new Error("Compression failed"));
                      if (blob.size <= targetSize || quality <= 0.1) {
                        const file = new File([blob], `docket-${ticket.rma || 'img'}-${index}.jpg`, { type: 'image/jpeg' });
                        resolve(file);
                      } else {
                        quality -= 0.1;
                        compress();
                      }
                    }, 'image/jpeg', quality);
                  };
                  compress();
                };
                img.onerror = (err) => reject(err);
                img.src = dataUrl;
              });
            };

            const filePromises = images.map((url, idx) => compressImageTo200KB(url, idx));
            const compressedFiles = await Promise.allSettled(filePromises);
            filesArray = compressedFiles.filter(res => res.status === 'fulfilled').map(res => res.value);
          }
        }

        const shareData = {
          title: `Ticket ${ticket.rma}`,
          text: `Ticket Details:\nRMA: ${ticket.rma}\nStatus: ${ticket.status}\nCustomer: ${ticket.name}\nProduct: ${ticket.product}\nVendor: ${ticket.serviceVendor || 'Unassigned'}\nSerial: ${ticket.serialNumber || 'N/A'}\nCourier Charge: ${ticket.courierCharge || 'N/A'}\nDocket Number: ${ticket.docketNumber || 'N/A'}`
        };

        if (filesArray.length > 0 && navigator.canShare && navigator.canShare({ files: filesArray })) {
          shareData.files = filesArray;
        }

        await navigator.share(shareData);
      } catch (err) {
        console.log('Share error:', err);
      }
    } else {
      alert("Sharing is not supported on this device/browser.");
    }
  };

  if (isLoading) {
    return <SkeletonLoader rows={7} />;
  }

  const uniqueYears = Array.from(new Set(recentActivities.map(a => {
    if (!a.date) return null;
    if (a.date.includes('-')) return a.date.split('-')[0];
    if (a.date.includes('/')) return a.date.split('/')[2];
    return null;
  }).filter(Boolean)));

  const STAT_CONFIG = [
    { label: 'Sent to Vendor', key: 'VENDOR OUTWARD', indicatorColor: '#F1F5F9' },
    { label: 'At Vendor', key: 'VENDOR INWARD', indicatorColor: '#93C5FD' },
    { label: 'Ready for Customer', key: 'CUSTOMER OUTWARD', indicatorColor: '#86EFAC' },
  ];

  return (
    <>
      <div className="workflow-stats-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {STAT_CONFIG.map(({ label, key, indicatorColor }) => {
          const count = recentActivities.filter(a => a.status === key).length;
          const displayCount = count < 10 ? `0${count}` : count;
          return (
            <div key={key} className="workflow-stat-card" style={{ padding: '20px 24px', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-strong)', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden' }}>
              <div className="stat-label" style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
              <div className="stat-value" style={{ fontSize: '36px', fontWeight: '700', color: '#1F2937', lineHeight: 1, letterSpacing: '-1px', marginBottom: '8px' }}>{displayCount}</div>
              <div style={{ position: 'absolute', bottom: 0, left: '24px', right: '24px', height: '4px', backgroundColor: indicatorColor, borderRadius: '4px 4px 0 0' }} />
            </div>
          );
        })}
      </div>

      {/* ── Header ── */}
      <div className="workflow-header">
        <div className="header-text">
          <h1 className="page-title">Replacement Workflow</h1>
          <p className="page-subtitle">Track and advance tickets through the RMA pipeline</p>
        </div>

        <div className="workflow-controls" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="search-box" style={{ border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', minWidth: '240px', height: '38px', borderRadius: '99px' }}>
            <Search size={15} color="#94A3B8" />
            <input
              type="text"
              className="search-input"
              placeholder="Search all fields..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 0 }}
              >
                ×
              </button>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#E0E7FF', color: '#4F46E5', border: 'none', padding: '0 16px', height: '38px', borderRadius: '99px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              <SlidersHorizontal size={14} />
              Filter
            </button>
          </div>
        </div>
      </div>
      
      {/* Inline Filters Bar */}
      {isFilterOpen && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', padding: '16px', background: '#F8F9FB', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <CustomDropdown
            value={filterMonth}
            onChange={setFilterMonth}
            prefix="Date range"
            options={[
              { value: 'All', label: 'None' },
              ...['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => ({
                value: m,
                label: new Date(2000, parseInt(m) - 1, 1).toLocaleString('default', { month: 'short' })
              }))
            ]}
          />
          <CustomDropdown
            value={workflowFilter}
            onChange={setWorkflowFilter}
            prefix="Item type"
            options={['All Items', 'Vendor Outward', 'Vendor Inward', 'Customer Outward', 'Completed'].map(tab => ({
              value: tab, 
              label: tab === 'All Items' ? 'All' : tab
            }))}
          />
          <CustomDropdown
            value={filterYear}
            onChange={setFilterYear}
            prefix="Year"
            options={[
              { value: 'All', label: 'All' },
              ...uniqueYears.map(y => ({ 
                value: String(y), 
                label: String(y)
              }))
            ]}
          />
          {(filterMonth !== 'All' || filterYear !== 'All' || workflowFilter !== 'All Items' || searchQuery !== '') && (
            <button 
              onClick={() => {
                setFilterMonth('All');
                setFilterYear('All');
                setWorkflowFilter('All Items');
                setSearchQuery('');
              }}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', 
                background: '#FEE2E2', color: '#DC2626', 
                border: 'none', padding: '8px 16px', 
                borderRadius: '99px', fontSize: '13px', 
                fontWeight: '600', cursor: 'pointer',
                marginLeft: '4px'
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>×</span> Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* ── Table Container ── */}
      <div className="workflow-table-container" style={{ flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="workflow-table">
            <thead>
              <tr>
                <th className="workflow-th" style={{ width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={selectedTickets.length > 0 && selectedTickets.length === paginatedGroups.length}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th className="workflow-th">Ticket #</th>
                <th className="workflow-th">Customer</th>
                <th className="workflow-th">Product</th>
                <th className="workflow-th">Serial</th>
                <th className="workflow-th">Company Name</th>
                <th className="workflow-th">Stage</th>
                <th className="workflow-th" style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedGroups.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
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
                      <td className="workflow-td" style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedTickets.includes(mainItem.id)}
                          onChange={() => handleSelectTicket(mainItem.id)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
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
                          {mainItem.category}
                        </span>
                      </td>
                      <td className="workflow-td">
                        <span className="table-serial">{mainItem.serialNumber || '—'}</span>
                      </td>
                      <td className="workflow-td">
                        <span className="table-cell-main" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{mainItem.serviceVendor}</span>
                      </td>
                      <td className="workflow-td">
                        <span className={`status-badge ${mainItem.statusClass}`}>
                          {mainItem.status}
                        </span>
                      </td>
                      <td className="workflow-td" style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          {hasMultiple ? (
                            <button
                              className="action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingItem(mainItem);
                              }}
                              title="View all services"
                              style={{ background: '#F1F5F9', color: '#64748B' }}
                            >
                              View all
                            </button>
                          ) : (
                            userRole === 'ADMIN' ? (
                              mainItem.status !== 'CUSTOMER OUTWARD' && mainItem.status !== 'COMPLETED' ? (
                                <button
                                  className="action-btn"
                                  disabled={isAdvancingId === mainItem.id}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setIsAdvancingId(mainItem.id);
                                    try {
                                      await setAdvancingItem(mainItem);
                                      setAdvanceDate(getTodayDate());
                                      setNewSerialNumber('');
                                      if (setDocketNumber) setDocketNumber('');
                                      setCourierCharge('');
                                    } finally {
                                      setIsAdvancingId(null);
                                    }
                                  }}
                                  title="Advance to next stage"
                                  style={{ background: '#E0E7FF', color: '#4F46E5' }}
                                >
                                  {isAdvancingId === mainItem.id ? <Loader2 size={15} className="animate-spin" /> : 'Advance →'}
                                </button>
                              ) : (
                                <button
                                  className="action-btn"
                                  style={{
                                    color: generatingReportId === mainItem.id ? 'var(--text-muted)' : '#1F2937',
                                    background: generatingReportId === mainItem.id ? 'var(--surface-hover)' : '#F1F5F9',
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
                                    ? <Loader2 size={15} className="spinner" />
                                    : mainItem.status === 'COMPLETED'
                                      ? 'Print'
                                      : 'Complete'
                                  }
                                </button>
                              )
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>—</span>
                            )
                          )}
                          <button
                            className="action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNativeShare(mainItem);
                            }}
                            title="Share Ticket"
                            style={{ background: '#F3F4F6', color: '#4B5563', padding: '6px', minWidth: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Share size={15} />
                          </button>
                        </div>
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
