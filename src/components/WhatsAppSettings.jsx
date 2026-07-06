import React, { useState, useEffect } from 'react';
import { Smartphone, RefreshCw, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import axios from 'axios';

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
    <div style={{ maxWidth: '600px', margin: '40px auto', backgroundColor: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#22c55e', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Smartphone color="white" size={28} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>WhatsApp Connection</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Link your device to automatically send PDF reports.</p>
        </div>
      </div>

      {status === 'loading' && (
        <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
          <RefreshCw className="spin" size={24} style={{ marginBottom: '8px' }} />
          <div>Checking connection status...</div>
        </div>
      )}

      {(status === 'idle' || status === 'pairing' || status === 'error') && (
        <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Admin Phone Number (with Country Code)</label>
            <input
              type="text"
              placeholder="e.g. 919876543210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !phoneNumber}
            style={{
              backgroundColor: '#25D366', color: 'white', padding: '12px', borderRadius: '8px', border: 'none',
              fontSize: '15px', fontWeight: 600, cursor: loading || !phoneNumber ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading || !phoneNumber ? 0.7 : 1
            }}
          >
            {loading ? <RefreshCw className="spin" size={18} /> : "Connect WhatsApp"}
          </button>
        </form>
      )}

      {status === 'pairing' && (
        <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>Pairing Code Generated!</h3>
          <div style={{ letterSpacing: '8px', fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '16px', padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '2px dashed #cbd5e1' }}>
            {pairingCode}
          </div>
          <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
            1. Open WhatsApp on your phone.<br/>
            2. Tap Menu (⋮) or Settings &gt; <strong>Linked Devices</strong>.<br/>
            3. Tap <strong>Link a Device</strong>.<br/>
            4. Tap <strong>Link with phone number instead</strong>.<br/>
            5. Enter the code above.<br/>
            <br/>
            <em>Once linked, refresh this page to see the updated status.</em>
          </p>
        </div>
      )}

      {status === 'connected' && (
        <div style={{ backgroundColor: '#f0fdf4', padding: '24px', borderRadius: '12px', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
          <CheckCircle color="#22c55e" size={48} />
          <div>
            <h3 style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '20px' }}>Connected to WhatsApp</h3>
            <p style={{ margin: 0, color: '#15803d', fontSize: '15px' }}>Number: <strong>{connectedNumber}</strong></p>
          </div>
          
          <button
            onClick={handleLogout}
            disabled={loading}
            style={{
              marginTop: '8px', backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px 16px', borderRadius: '8px', border: '1px solid #fecaca',
              fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? <RefreshCw className="spin" size={16} /> : <LogOut size={16} />}
            Logout Session
          </button>
        </div>
      )}

      {status === 'error' && (
        <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '8px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle color="#ef4444" size={24} />
          <div style={{ color: '#991b1b', fontWeight: 500 }}>{message}</div>
        </div>
      )}

    </div>
  );
}
