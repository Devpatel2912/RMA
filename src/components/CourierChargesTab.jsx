import React, { useState } from 'react';
import { Truck, Search, Package } from 'lucide-react';

const CourierChargesTab = ({ recentActivities }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const ticketsWithCharges = recentActivities.filter((ticket) => {
    if (!ticket.courierCharge) return false;
    const chargeStr = ticket.courierCharge.toString().trim();
    return chargeStr !== '' && chargeStr !== '0';
  });

  const filteredTickets = ticketsWithCharges.filter(ticket => {
    const term = searchTerm.toLowerCase();
    return (
      ticket.rma.toLowerCase().includes(term) ||
      ticket.name?.toLowerCase().includes(term) ||
      ticket.customerName?.toLowerCase().includes(term)
    );
  });

  const totalCharge = filteredTickets.reduce((sum, t) => {
    const val = parseFloat(t.courierCharge);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const ACCENT_COLORS = ['#10b981', '#22C55E', '#8B5CF6', '#F59E0B', '#EC4899'];

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div className="header" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'none',
          }}>
            <Truck size={20} color="#fff" />
          </div>
          <div>
            <h1 className="page-title" style={{ fontSize: 22 }}>Courier Charges</h1>
            <p className="page-subtitle">View and track courier charges for all tickets</p>
          </div>
        </div>
      </div>

      {/* ── Summary Strip ── */}
      {filteredTickets.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, padding: '14px 20px',
          background: 'var(--primary-light)',
          border: '1px solid rgba(4,120,87,0.15)',
          borderRadius: 'var(--radius)',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Package size={16} color="var(--primary)" />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{filteredTickets.length}</strong> tickets with charges
            </span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>
            Total: ₹ {totalCharge.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </div>
        </div>
      )}

      {/* ── Main Card ── */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: 'none',
      }}>

        {/* Search + count bar */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, background: 'var(--surface-hover)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Truck size={15} color="var(--primary)" />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>All Charges</span>
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--primary)',
              background: 'var(--primary-light)', padding: '2px 10px', borderRadius: 99,
            }}>
              {filteredTickets.length}
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search RMA or customer..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                padding: '7px 12px 7px 30px', fontSize: 13,
                border: '1.5px solid var(--border)', borderRadius: 8,
                outline: 'none', background: 'var(--surface)',
                color: 'var(--text-primary)', width: 200,
                fontFamily: 'Inter, sans-serif', transition: 'border-color 0.18s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {/* List body */}
        {filteredTickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
            <Truck size={32} style={{ marginBottom: 12, opacity: 0.2, display: 'block', margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontSize: 14 }}>
              {searchTerm ? 'No tickets match your search.' : 'No courier charges recorded yet.'}
            </p>
          </div>
        ) : (
          <div>
            {filteredTickets.map((ticket, idx) => {
              const accentColor = ACCENT_COLORS[idx % ACCENT_COLORS.length];
              return (
                <div
                  key={ticket.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background-color 0.15s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {/* Left accent */}
                  <div style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: 3, background: accentColor, borderRadius: '0 2px 2px 0',
                  }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginLeft: 12, flex: 1 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9,
                      background: `${accentColor}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Truck size={16} color={accentColor} />
                    </div>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                        {ticket.rma}
                      </p>
                      <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        {ticket.customerName || ticket.name || 'Unknown Customer'}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    padding: '7px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--success-light)',
                    color: '#15803D',
                    fontWeight: 800,
                    fontSize: 15,
                    border: '1px solid var(--success-border)',
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '-0.3px',
                  }}>
                    ₹ {ticket.courierCharge}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourierChargesTab;
