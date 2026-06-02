import React from 'react';
import { User, Truck } from 'lucide-react';

export default function LedgersTab({ recentActivities, setViewingItem }) {
  return (
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
            <div className="customer-card" key={`cust-${item.id}`} onClick={() => setViewingItem(item)} style={{ cursor: 'pointer' }}>
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
                <div className={`progress-segment ${item.status === 'VENDOR OUTWARD' || item.status === 'VENDOR INWARD' || item.status === 'CUSTOMER OUTWARD' || item.status === 'COMPLETED' ? 'active' : ''}`}></div>
                <div className={`progress-segment ${item.status === 'VENDOR INWARD' || item.status === 'CUSTOMER OUTWARD' || item.status === 'COMPLETED' ? 'active' : ''}`}></div>
                <div className={`progress-segment ${item.status === 'CUSTOMER OUTWARD' || item.status === 'COMPLETED' ? 'active' : ''}`}></div>
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
            <div className="vendor-card" key={`vend-${item.id}`} onClick={() => setViewingItem(item)} style={{ cursor: 'pointer' }}>
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
  );
}
