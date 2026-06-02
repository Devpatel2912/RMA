import React from 'react';
import { Search, ArrowRightCircle, Share } from 'lucide-react';

export default function WorkflowTab({
  workflowFilter, setWorkflowFilter,
  searchQuery, setSearchQuery,
  filteredWorkflowItems,
  setAdvancingItem, setAdvanceDate, setNewSerialNumber, setCourierCharge,
  getTodayDate, handleGenerateReport, setViewingItem
}) {
  return (
    <>
      <div className="workflow-header">
        <div className="header-text">
          <h1 className="page-title">Replacement Workflow</h1>
        </div>

        <div className="workflow-controls">
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
            {filteredWorkflowItems.map((item) => (
              <tr className="workflow-tr" key={item.id} onClick={() => setViewingItem(item)} style={{ cursor: 'pointer' }}>
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
                  {item.status !== 'CUSTOMER OUTWARD' && item.status !== 'COMPLETED' ? (
                    <button
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAdvancingItem(item);
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
                      style={{ color: '#059669', backgroundColor: '#d1fae5' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateReport(item);
                      }}
                      title="Generate Final Report & Send to WhatsApp"
                    >
                      <Share size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
