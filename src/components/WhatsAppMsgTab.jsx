import React, { useMemo, useState } from 'react';
import { MessageSquare, Plus, Save, X } from 'lucide-react';

const STORAGE_KEY = 'rma-whatsapp-message-config';

const stageOptions = [
  'Customer Inward',
  'Vendor Outward',
  'Vendor Inward',
  'Customer Outward',
  'Completed',
];

const initialFormats = [
  {
    name: 'Default',
    message: 'Dear customer, your RMA update is ready. Please contact us for more details.',
  },
  {
    name: 'RMA Customer Status',
    message: 'Dear customer, your RMA request status has been updated.',
  },
];

const emptyForm = {
  stage: '',
  format: 'Default',
  mobileNumber: '',
  message: initialFormats[0].message,
};

const getSavedConfig = () => {
  try {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    return savedConfig ? JSON.parse(savedConfig) : null;
  } catch {
    return null;
  }
};

const WhatsAppMsgTab = () => {
  const savedConfig = useMemo(() => getSavedConfig(), []);
  const [formats, setFormats] = useState(savedConfig?.formats || initialFormats);
  const [formData, setFormData] = useState(savedConfig?.formData || emptyForm);
  const [isAddingFormat, setIsAddingFormat] = useState(false);
  const [newFormat, setNewFormat] = useState({ name: '', message: '' });

  const selectedFormat = useMemo(
    () => formats.find((format) => format.name === formData.format),
    [formats, formData.format]
  );

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleFormatChange = (formatName) => {
    const nextFormat = formats.find((format) => format.name === formatName);
    setFormData((current) => ({
      ...current,
      format: formatName,
      message: nextFormat?.message || current.message,
    }));
  };

  const openAddFormat = () => {
    setNewFormat({ name: '', message: formData.message || '' });
    setIsAddingFormat(true);
  };

  const closeAddFormat = () => {
    setIsAddingFormat(false);
    setNewFormat({ name: '', message: '' });
  };

  const handleSaveNewFormat = () => {
    const normalizedName = newFormat.name.trim();
    const normalizedMessage = newFormat.message.trim();

    if (!normalizedName || !normalizedMessage) {
      alert('Please enter format name and message.');
      return;
    }

    if (formats.some((format) => format.name.toLowerCase() === normalizedName.toLowerCase())) {
      alert('This format already exists.');
      return;
    }

    const newFormat = {
      name: normalizedName,
      message: normalizedMessage,
    };

    setFormats((current) => [...current, newFormat]);
    setFormData((current) => ({
      ...current,
      format: normalizedName,
      message: newFormat.message,
    }));
    closeAddFormat();
  };

  const handleCancel = () => {
    setFormData(emptyForm);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.stage || !formData.mobileNumber.trim() || !formData.message.trim()) {
      alert('Please select stage, enter mobile number, and add message.');
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        formats,
        formData: {
          ...formData,
          mobileNumber: formData.mobileNumber.trim(),
          message: formData.message.trim(),
        },
      })
    );
    alert('WhatsApp message format saved.');
  };

  return (
    <div className="tab-pane active">
      <div className="header" style={{ marginBottom: 24 }}>
        <div className="header-text">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MessageSquare size={24} />
            WhatsApp Message
          </h1>
          <p className="page-subtitle">Create stage-wise WhatsApp message formats</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 760 }}>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: 24 }}>
            <div className="form-row" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ minWidth: 220 }}>
                <label className="form-label">Stage</label>
                <select
                  className="form-select"
                  value={formData.stage}
                  onChange={(event) => updateField('stage', event.target.value)}
                >
                  <option value="">Select stage</option>
                  {stageOptions.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ minWidth: 220 }}>
                <label className="form-label">Format</label>
                <select
                  className="form-select"
                  value={formData.format}
                  onChange={(event) => handleFormatChange(event.target.value)}
                >
                  {formats.map((format) => (
                    <option key={format.name} value={format.name}>
                      {format.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={openAddFormat}
                title="Add format"
                aria-label="Add format"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <Plus size={18} />
              </button>
            </div>

            {isAddingFormat && (
              <div
                style={{
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  background: 'var(--surface-hover)',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div className="form-group">
                  <label className="form-label">Format Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Repair Update"
                    value={newFormat.name}
                    onChange={(event) => setNewFormat((current) => ({ ...current, name: event.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Enter format message..."
                    value={newFormat.message}
                    onChange={(event) => setNewFormat((current) => ({ ...current, message: event.target.value }))}
                    style={{ minHeight: 120 }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={closeAddFormat}
                    style={{ flex: '0 0 auto', minWidth: 110 }}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn-save"
                    onClick={handleSaveNewFormat}
                    style={{ flex: '0 0 auto', minWidth: 110 }}
                  >
                    <Save size={16} /> Save
                  </button>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. 919876543210"
                value={formData.mobileNumber}
                onChange={(event) => updateField('mobileNumber', event.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea
                className="form-textarea"
                placeholder="Enter WhatsApp message..."
                value={formData.message}
                onChange={(event) => updateField('message', event.target.value)}
                style={{ minHeight: 150 }}
              />
              {selectedFormat && (
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 12 }}>
                  Selected format: {selectedFormat.name}
                </p>
              )}
            </div>
          </div>

          <div className="modal-footer" style={{ borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
            <button
              type="button"
              className="btn-cancel"
              onClick={handleCancel}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <X size={16} /> Cancel
            </button>
            <button type="submit" className="btn-save">
              <Save size={16} /> Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WhatsAppMsgTab;
