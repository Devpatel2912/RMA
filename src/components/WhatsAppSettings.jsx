import React, { useState, useEffect } from 'react';
import { Smartphone, RefreshCw, CheckCircle, AlertCircle, LogOut, Wifi, WifiOff } from 'lucide-react';
import axios from 'axios';
import Spinner from './Spinner';

export default function WhatsAppSettings() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('loading'); // 'loading', 'idle', 'pairing', 'connected', 'error'
  const [pairingCode, setPairingCode] = useState('');
  const [message, setMessage] = useState('');
  const [connectedNumber, setConnectedNumber] = useState('');

  const checkStatus = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
      const response = await axios.get(`${baseUrl}/whatsapp/status`);
      if (response.data.connected) {
        setStatus('connected');
        setConnectedNumber(response.data.phoneNumber);
        setMessage("WhatsApp is successfully linked.");
      } else {
        setStatus('idle');
      }
    } catch (err) {
      console.error("Failed to fetch WhatsApp status", err);
      setStatus('idle');
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to disconnect WhatsApp?")) return;
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
      await axios.post(`${baseUrl}/whatsapp/logout`);
      setStatus('idle');
      setConnectedNumber('');
      setPhoneNumber('');
    } catch (err) {
      console.error("Failed to logout", err);
      alert("Failed to disconnect WhatsApp session.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      alert("Please enter a valid phone number with country code (e.g. 919876543210)");
      return;
    }

    setLoading(true);
    setStatus('idle');
    setPairingCode('');
    
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
      const response = await axios.post(`${baseUrl}/whatsapp/connect`, { phoneNumber });
      
      if (response.data.pairingCode) {
        setPairingCode(response.data.pairingCode);
        setStatus('pairing');
        setMessage(response.data.message);
      } else if (response.data.success) {
        setStatus('connected');
        setMessage(response.data.message);
      } else {
        setStatus('error');
        setMessage(response.data.message || "Failed to connect.");
      }
    } catch (err) {
      console.error("WhatsApp Connect Error:", err);
      setStatus('error');
      setMessage(err.response?.data?.error || "An error occurred while connecting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div className="header" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #22C55E, #16A34A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'none',
          }}>
            <Smartphone size={20} color="#fff" />
          </div>
          <div>
            <h1 className="page-title" style={{ fontSize: 22 }}>WhatsApp Integration</h1>
            <p className="page-subtitle">Link your device to send PDF reports automatically</p>
          </div>
        </div>
      </div>

      {/* ── Status Card ── */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'none',
        overflow: 'hidden',
      }}>

        {/* Status indicator strip */}
        <div style={{
          padding: '14px 24px',
          background: status === 'connected' ? 'var(--success-light)' : status === 'error' ? 'var(--error-light)' : 'var(--surface-hover)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          {status === 'connected' ? (
            <><Wifi size={16} color="var(--success)" /><span style={{ fontSize: 13, fontWeight: 600, color: '#15803D' }}>Connected</span></>
          ) : status === 'loading' ? (
            <><Spinner size="xs" variant="muted" /><span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Checking status…</span></>
          ) : status === 'error' ? (
            <><WifiOff size={16} color="var(--error)" /><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--error)' }}>Connection Error</span></>
          ) : (
            <><WifiOff size={16} color="var(--text-muted)" /><span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Not Connected</span></>
          )}
        </div>

        <div style={{ padding: 28 }}>

          {/* Loading */}
          {status === 'loading' && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>
              <Spinner size="md" variant="primary" label="Checking connection…" />
            </div>
          )}

          {/* Idle / Error — Connect Form */}
          {(status === 'idle' || status === 'pairing' || status === 'error') && (
            <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: status === 'pairing' || status === 'error' ? 24 : 0 }}>
              <div className="form-group">
                <label className="form-label">Admin Phone Number (with Country Code)</label>
                <input
                  type="text"
                  placeholder="e.g. 919876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="form-input"
                  disabled={loading}
                />
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Format: country code + number (no spaces/dashes)
                </p>
              </div>
              <button
                type="submit"
                disabled={loading || !phoneNumber}
                style={{
                  background: loading || !phoneNumber
                    ? 'var(--border)'
                    : 'linear-gradient(135deg, #22C55E, #16A34A)',
                  color: loading || !phoneNumber ? 'var(--text-muted)' : 'white',
                  padding: '12px 20px', borderRadius: 'var(--radius-sm)',
                  border: 'none', fontSize: 14, fontWeight: 700,
                  cursor: loading || !phoneNumber ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                  boxShadow: loading || !phoneNumber ? 'none' : '0 4px 14px rgba(34,197,94,0.35)',
                  transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
                  opacity: loading || !phoneNumber ? 0.6 : 1,
                }}
              >
                {loading ? <Spinner size="xs" variant="white" /> : <Smartphone size={17} />}
                {loading ? 'Connecting…' : 'Connect WhatsApp'}
              </button>
            </form>
          )}

          {/* Pairing Code */}
          {status === 'pairing' && (
            <div style={{
              background: 'var(--primary-light)',
              border: '1.5px solid rgba(4,120,87,0.2)',
              borderRadius: 'var(--radius)',
              padding: 24, textAlign: 'center',
            }}>
              <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Pairing Code Generated
              </p>
              <div style={{
                letterSpacing: 10, fontSize: 34, fontWeight: 800,
                color: 'var(--primary)', padding: '16px 24px',
                background: 'var(--surface)', borderRadius: 'var(--radius-sm)',
                border: '2px dashed var(--border)', marginBottom: 20,
                fontFamily: 'monospace',
              }}>
                {pairingCode}
              </div>
              <div style={{ textAlign: 'left', fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 2 }}>
                <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--text-primary)' }}>Steps to link:</p>
                <ol style={{ margin: 0, paddingLeft: 18 }}>
                  <li>Open WhatsApp on your phone</li>
                  <li>Tap Menu (⋮) or Settings → <strong>Linked Devices</strong></li>
                  <li>Tap <strong>Link a Device</strong></li>
                  <li>Tap <strong>Link with phone number instead</strong></li>
                  <li>Enter the code above</li>
                </ol>
                <p style={{ margin: '12px 0 0', fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Refresh this page once linked to see updated status.
                </p>
              </div>
            </div>
          )}

          {/* Connected */}
          {status === 'connected' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center', padding: '8px 0 16px' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'var(--success-light)',
                border: '3px solid var(--success-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle size={36} color="var(--success)" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 6px', color: '#15803D', fontSize: 18, fontWeight: 700 }}>WhatsApp Connected</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>
                  Linked to: <strong style={{ color: 'var(--text-primary)' }}>{connectedNumber}</strong>
                </p>
              </div>
              <button
                onClick={handleLogout}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--error-light)', border: '1.5px solid var(--error-border)',
                  color: 'var(--error)', fontSize: 13.5, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1, transition: 'all 0.18s',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {loading ? <Spinner size="xs" variant="muted" /> : <LogOut size={16} />}
                Disconnect Session
              </button>
            </div>
          )}

          {/* Error message */}
          {status === 'error' && message && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'var(--error-light)', border: '1.5px solid var(--error-border)',
              borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginTop: 16,
            }}>
              <AlertCircle size={20} color="var(--error)" style={{ flexShrink: 0 }} />
              <span style={{ color: '#991B1B', fontWeight: 500, fontSize: 13.5 }}>{message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
