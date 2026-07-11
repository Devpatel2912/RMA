import React from 'react';
import { Download, ClipboardList, Truck, Package, UserCheck, History, CheckCircle2 } from 'lucide-react';
import { useTickets } from '../api/hooks';
import { SkeletonLoader } from './Spinner';

const STAT_CONFIG = [
  {
    label: 'Customer Inward',
    key: 'CUSTOMER INWARD',
    icon: ClipboardList,
    iconBg: 'rgba(4,120,87,0.12)',
    iconColor: '#047857',
    indicatorColor: '#047857',
    statusClass: 'bg-blue-light',
  },
  {
    label: 'Sent to Vendor',
    key: 'VENDOR OUTWARD',
    icon: Truck,
    iconBg: 'rgba(245,158,11,0.12)',
    iconColor: '#F59E0B',
    indicatorColor: '#F59E0B',
    statusClass: 'bg-yellow-light',
  },
  {
    label: 'At Vendor',
    key: 'VENDOR INWARD',
    icon: Package,
    iconBg: 'rgba(139,92,246,0.12)',
    iconColor: '#8B5CF6',
    indicatorColor: '#8B5CF6',
    statusClass: 'bg-purple-light',
  },
  {
    label: 'Ready for Customer',
    key: 'CUSTOMER OUTWARD',
    icon: UserCheck,
    iconBg: 'rgba(16,185,129,0.12)',
    iconColor: '#10B981',
    indicatorColor: '#10B981',
    statusClass: 'bg-green-light',
  },
];

export default function DashboardTab({ handleExportData, setViewingItem }) {
  const { data: recentActivities = [], isLoading } = useTickets();

  if (isLoading) {
    return <SkeletonLoader rows={6} />;
  }

  const completedCount = recentActivities.filter(a => a.status === 'COMPLETED').length;

  return (
    <>
      {/* ── Page Header ── */}
      <div className="header">
        <div className="header-text">
          <h1 className="page-title">Operational Overview</h1>
          <p className="page-subtitle">Real-time metrics of your replacement cycle</p>
        </div>
        <button className="export-btn" onClick={handleExportData}>
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stats-grid">
        {STAT_CONFIG.map(({ label, key, icon: Icon, iconBg, iconColor, indicatorColor }) => {
          const count = recentActivities.filter(a => a.status === key).length;
          return (
            <div
              className="stat-card"
              key={key}
              style={{ '--indicator-color': indicatorColor }}
            >
              <div className="stat-info">
                <span className="stat-label">{label}</span>
                <span className="stat-value">{count}</span>
                <div className="stat-indicator" style={{ backgroundColor: indicatorColor }} />
              </div>
              <div
                className="stat-icon-box"
                style={{ backgroundColor: iconBg }}
              >
                <Icon size={22} color={iconColor} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Completed summary strip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 20px',
        background: 'var(--success-light)',
        border: '1px solid var(--success-border)',
        borderRadius: 'var(--radius)',
        fontSize: 13,
        fontWeight: 500,
        color: '#15803D',
      }}>
        <CheckCircle2 size={17} color="#22C55E" />
        <span><strong>{completedCount}</strong> ticket{completedCount !== 1 ? 's' : ''} marked as Completed</span>
      </div>

      {/* ── Recent Activity ── */}
      <div className="activity-section">
        <div className="section-header">
          <History size={17} color="var(--primary)" />
          <span>Recent Activity</span>
          <span style={{
            marginLeft: 'auto',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-muted)',
          }}>
            Last {Math.min(recentActivities.length, 10)} of {recentActivities.length}
          </span>
        </div>

        <div className="activity-list">
          {recentActivities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-muted)' }}>
              <History size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: 14 }}>No tickets yet. Create your first inward entry.</p>
            </div>
          ) : (
            recentActivities.slice(0, 10).map((activity, index) => (
              <div
                className="activity-item"
                key={index}
                onClick={() => setViewingItem(activity)}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Color accent box */}
                <div
                  className={`activity-id-box ${activity.statusClass}`}
                  style={{ fontSize: 11, fontWeight: 700 }}
                >
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div className="activity-details">
                  <span className="activity-name">{activity.name}</span>
                  <span className="activity-product">{activity.product} · {activity.rma}</span>
                </div>

                <div className="activity-meta">
                  <span className={`status-badge ${activity.statusClass}`}>
                    {activity.status}
                  </span>
                  <span className="activity-date">{activity.date}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
