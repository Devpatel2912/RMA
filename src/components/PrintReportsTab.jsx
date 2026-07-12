import { useState } from 'react';
import { Printer, Search, CheckCircle2, Package, Truck, UserCheck, FileText, Loader2 } from 'lucide-react';
import { generateTicketPDF } from '../utils/pdfGenerator';
import axios from 'axios';

const STAGE_CONFIG = [
  {
    key: 'hasCustomerInward',
    title: 'Customer Inward',
    icon: UserCheck,
    stageName: 'CUSTOMER INWARD',
    summary: 'Initial receipt from the customer. Includes product condition and customer details.',
    accentColor: '#10b981',
    accentBg: 'rgba(16,185,129,0.08)',
  },
  {
    key: 'hasVendorOutward',
    title: 'Vendor Outward',
    icon: Truck,
    stageName: 'VENDOR OUTWARD',
    summary: 'Shipping manifest and courier details for sending the product to the service vendor.',
    accentColor: '#F59E0B',
    accentBg: 'rgba(245,158,11,0.08)',
  },
  {
    key: 'hasVendorInward',
    title: 'Vendor Inward',
    icon: Package,
    stageName: 'VENDOR INWARD',
    summary: 'Receipt of repaired/replaced product from the vendor including new serial numbers.',
    accentColor: '#8B5CF6',
    accentBg: 'rgba(139,92,246,0.08)',
  },
  {
    key: 'hasCustomerOutward',
    title: 'Final Resolution',
    icon: CheckCircle2,
    stageName: 'FINAL RESOLUTION',
    summary: 'Comprehensive final report with all tracking history and final resolution summary.',
    accentColor: '#22C55E',
    accentBg: 'rgba(34,197,94,0.08)',
  },
];

function StageCard({ title, icon: Icon, isActive, summary, accentColor, accentBg, printHandler, isPrinting }) {
  return (
    <div style={{
      background: 'var(--surface)', border: `1px solid ${isActive ? accentColor + '30' : 'var(--border)'}`,
      borderRadius: 'var(--radius-md)', padding: 20,
      display: 'flex', flexDirection: 'column', gap: 16,
      opacity: isActive ? 1 : 0.6,
      boxShadow: isActive ? '0 4px 20px rgba(0,0,0,0.03)' : 'none',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: isActive ? accentBg : 'var(--surface-hover)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={22} color={isActive ? accentColor : 'var(--text-muted)'} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
          {isActive && (
            <span style={{
              fontSize: 10.5, fontWeight: 700, color: accentColor,
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>Available</span>
          )}
        </div>
      </div>

      {/* Summary */}
      <p style={{ flex: 1, margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{summary}</p>

      {/* Print Button */}
      <button
        onClick={isActive && !isPrinting ? printHandler : undefined}
        disabled={!isActive || isPrinting}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '10px 16px',
          background: isActive ? accentColor : 'var(--border)',
          color: isActive ? 'white' : 'var(--text-muted)',
          border: 'none', borderRadius: 'var(--radius-sm)',
          fontWeight: 700, fontSize: 13, cursor: (isActive && !isPrinting) ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
          boxShadow: isActive ? `0 3px 10px ${accentColor}35` : 'none',
          opacity: isPrinting ? 0.7 : 1
        }}
      >
        {isPrinting ? <Loader2 size={15} className="spin" /> : <Printer size={15} />}
        {isPrinting ? 'Printing...' : `Print ${title}`}
      </button>
    </div>
  );
}

export default function PrintReportsTab({ recentActivities }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [printingStage, setPrintingStage] = useState(null);

  const selectedTicket = recentActivities.find(t => t.id === selectedTicketId);

  const getStageStatus = (ticket) => {
    if (!ticket) return {};
    const statuses = ['CUSTOMER INWARD', 'VENDOR OUTWARD', 'VENDOR INWARD', 'CUSTOMER OUTWARD', 'COMPLETED'];
    const currentIndex = statuses.indexOf(ticket.status);
    return {
      hasCustomerInward: currentIndex >= 0,
      hasVendorOutward: currentIndex >= 2,
      hasVendorInward: currentIndex >= 3,
      hasCustomerOutward: currentIndex >= 4,
    };
  };

  const handlePrint = async (stageName, ticket) => {
    setPrintingStage(stageName);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
      const res = await axios.get(`${baseUrl}/tickets/${ticket.id}`);
      generateTicketPDF(stageName, res.data);
    } catch(e) {
      console.error("Failed to fetch full ticket details for print:", e);
      generateTicketPDF(stageName, ticket);
    } finally {
      setPrintingStage(null);
    }
  };

  const stageFlags = getStageStatus(selectedTicket);

  const filteredSearch = recentActivities.filter(t =>
    t.rma.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="print-reports-container" style={{ maxWidth: 960, margin: '0 auto', width: '100%' }}>

      {/* ── Header ── */}
      <div className="header print-controls" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--primary), #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'none',
          }}>
            <FileText size={20} color="#fff" />
          </div>
          <div>
            <h1 className="page-title" style={{ fontSize: 22 }}>Ticket-wise Printing</h1>
            <p className="page-subtitle">Select a ticket to print stage-specific reports</p>
          </div>
        </div>
      </div>

      {/* ── Ticket Search ── */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'none',
        padding: 24,
        marginBottom: 24,
      }}>
        <label style={{
          fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)',
          textTransform: 'uppercase', letterSpacing: '0.5px',
          marginBottom: 10, display: 'block',
        }}>
          Search Customer, RMA, or Ticket Number
        </label>

        <div style={{
          display: 'flex', alignItems: 'center',
          background: 'var(--surface-hover)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 16px', gap: 12,
          transition: 'border-color 0.18s',
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--primary)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <Search size={17} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="e.g. Alex Rivers, RMA-842109, or TICKET-123"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value === '') setSelectedTicketId(null);
            }}
            style={{
              border: 'none', outline: 'none',
              background: 'transparent', width: '100%',
              fontSize: 14.5, color: 'var(--text-primary)',
              fontFamily: 'Inter, sans-serif',
            }}
          />
          {searchQuery && selectedTicketId && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedTicketId(null); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18, lineHeight: 1, padding: 0 }}
            >
              ×
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        {!selectedTicketId && (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            marginTop: 10,
            maxHeight: 360,
            overflowY: 'auto',
            boxShadow: 'none',
          }}>
            {filteredSearch.length > 0 ? (
              filteredSearch.map(t => (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTicketId(t.id);
                    setSearchQuery(`${t.rma} — ${t.name}`);
                  }}
                  style={{
                    padding: '12px 18px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-light)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 13.5, fontFamily: 'monospace' }}>{t.rma}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>{t.name} · {t.product}</div>
                  </div>
                  <span className={`status-badge ${t.statusClass}`}>{t.status}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: 20, color: 'var(--text-muted)', textAlign: 'center', fontSize: 13.5 }}>
                No tickets found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Stage Cards ── */}
      {selectedTicket && (
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 18, flexWrap: 'wrap', gap: 10,
          }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Available Stage Reports
            </h2>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Current Status: <span className={`status-badge ${selectedTicket.statusClass}`}>{selectedTicket.status}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
            {STAGE_CONFIG.map(({ key, title, icon, stageName, summary, accentColor, accentBg }) => (
              <StageCard
                key={key}
                title={title}
                icon={icon}
                isActive={stageFlags[key]}
                summary={summary}
                accentColor={accentColor}
                accentBg={accentBg}
                isPrinting={printingStage === stageName}
                printHandler={() => handlePrint(stageName, selectedTicket)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
