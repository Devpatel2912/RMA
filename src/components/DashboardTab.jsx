import React from 'react';
import { Download, ClipboardList, Truck, Package, UserCheck, History } from 'lucide-react';
import { useTickets } from '../api/hooks';
import { SkeletonLoader } from './Spinner';

export default function DashboardTab({ handleExportData, setViewingItem }) {
  const { data: recentActivities = [], isLoading } = useTickets();

  if (isLoading) {
    return <SkeletonLoader rows={6} />;
  }

  return (
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
  );
}
