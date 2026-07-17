import React, { useMemo, useState, useEffect } from 'react';
import { MessageSquare, Plus, Save, X } from 'lucide-react';
import axios from 'axios';

const LOCAL_FORMATS_KEY = 'rma-local-whatsapp-formats';

const stageOptions = [
  'Customer Inward',
  'Vendor Outward',
  'Vendor Inward',
  'Customer Outward',
  'Completed',
];

const emptyForm = {
  stage: '',
  format: '',
  message: '',
};

const getLocalFormats = () => {
  try {
    const savedFormats = localStorage.getItem(LOCAL_FORMATS_KEY);
    return savedFormats ? JSON.parse(savedFormats) : [];
  } catch {
    return [];
  }
};

const saveLocalFormats = (formats) => {
  localStorage.setItem(LOCAL_FORMATS_KEY, JSON.stringify(formats));
};

const WhatsAppMsgTab = () => {
  const [formats, setFormats] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [isAddingFormat, setIsAddingFormat] = useState(false);
  const [newFormat, setNewFormat] = useState({ name: '', message: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFormats = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
        const response = await axios.get(`${baseUrl}/whatsapp-formats`);
        const localFormats = getLocalFormats();
        const serverFormats = response.data || [];
        const mergedFormats = [
          ...serverFormats,
          ...localFormats.filter(
            (localFormat) =>
              !serverFormats.some(
                (serverFormat) =>
                  serverFormat.stage === localFormat.stage &&
                  serverFormat.name.toLowerCase() === localFormat.name.toLowerCase()
              )
          ),
        ];
        setFormats(mergedFormats);
      } catch (err) {
        console.error("Failed to fetch formats:", err);
        setFormats(getLocalFormats());
      } finally {
        setIsLoading(false);
      }
    };
    fetchFormats();
  }, []);

  const selectedFormat = useMemo(
    () => formats.find((format) => format.name === formData.format && format.stage === formData.stage),
    [formats, formData.format, formData.stage]
  );

  const availableFormatsForStage = useMemo(
    () => formats.filter((format) => format.stage === formData.stage),
    [formats, formData.stage]
  );
  const hasSelectedStage = Boolean(formData.stage);
  const hasFormatsForSelectedStage = availableFormatsForStage.length > 0;

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleStageChange = (newStage) => {
    const available = formats.filter(f => f.stage === newStage);
    const newFormatName = available.length > 0 ? available[0].name : '';
    const newMessage = available.length > 0 ? available[0].message : '';
    
    setFormData((current) => ({
      ...current,
      stage: newStage,
      format: newFormatName,
      message: newMessage,
    }));
  };

  const handleFormatChange = (formatName) => {
    const nextFormat = formats.find((format) => format.name === formatName && format.stage === formData.stage);
    setFormData((current) => ({
      ...current,
      format: formatName,
      message: nextFormat?.message || current.message,
    }));
  };

  const openAddFormat = () => {
    if (!formData.stage) {
      alert("Please select a stage first to add a format to it.");
      return;
    }
    setNewFormat({ name: '', message: formData.message || '' });
    setIsAddingFormat(true);
  };

  const closeAddFormat = () => {
    setIsAddingFormat(false);
    setNewFormat({ name: '', message: '' });
  };

  const handleDeleteFormat = async () => {
    if (!formData.format || !formData.stage) return;
    
    const formatToDelete = formats.find(f => f.name === formData.format && f.stage === formData.stage);
    if (!formatToDelete || !formatToDelete.id) return;
    
    if (!window.confirm(`Are you sure you want to delete the format "${formData.format}"?`)) return;

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
      if (String(formatToDelete.id).startsWith('local-')) {
        saveLocalFormats(getLocalFormats().filter((format) => format.id !== formatToDelete.id));
      } else {
        await axios.delete(`${baseUrl}/whatsapp-formats/${formatToDelete.id}`);
      }
      
      const nextFormats = formats.filter(f => f.id !== formatToDelete.id);
      const availableAfterDelete = nextFormats.filter(f => f.stage === formData.stage);
      
      const newFormatName = availableAfterDelete.length > 0 ? availableAfterDelete[0].name : '';
      const newMessage = availableAfterDelete.length > 0 ? availableAfterDelete[0].message : '';

      setFormats(nextFormats);
      setFormData({
        ...formData,
        format: newFormatName,
        message: newMessage
      });
    } catch (err) {
      console.error("Failed to delete format:", err);
      alert("Failed to delete format.");
    }
  };

  const handleSaveNewFormat = async () => {
    const normalizedName = newFormat.name.trim();
    const normalizedMessage = newFormat.message.trim();

    if (!normalizedName || !normalizedMessage) {
      alert('Please enter format name and message.');
      return;
    }

    if (formats.some((format) => format.name.toLowerCase() === normalizedName.toLowerCase() && format.stage === formData.stage)) {
      alert('This format already exists for this stage.');
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
      const response = await axios.post(`${baseUrl}/whatsapp-formats`, {
        stage: formData.stage,
        name: normalizedName,
        message: normalizedMessage
      });
      
      const savedFormat = response.data;
      const nextFormats = [...formats, savedFormat];
      
      setFormats(nextFormats);
      setFormData({
        ...formData,
        format: savedFormat.name,
        message: savedFormat.message,
      });
      closeAddFormat();
    } catch (err) {
      console.error("Failed to save format:", err);
      const localFormat = {
        id: `local-${Date.now()}`,
        stage: formData.stage,
        name: normalizedName,
        message: normalizedMessage,
      };
      const nextFormats = [...formats, localFormat];
      const nextLocalFormats = [...getLocalFormats(), localFormat];

      setFormats(nextFormats);
      saveLocalFormats(nextLocalFormats);
      setFormData({
        ...formData,
        format: localFormat.name,
        message: localFormat.message,
      });
      closeAddFormat();
    }
  };

  const handleCancel = () => {
    setFormData(emptyForm);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    alert('WhatsApp message format saved (Note: Formatting is saved automatically when adding).');
  };

  if (isLoading) {
    return <div style={{ padding: 24 }}>Loading formats...</div>;
  }

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
                  onChange={(event) => handleStageChange(event.target.value)}
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
                  disabled={!hasSelectedStage || !hasFormatsForSelectedStage}
                >
                  {!hasSelectedStage ? (
                    <option value="">Select stage first</option>
                  ) : !hasFormatsForSelectedStage ? (
                    <option value="">No format added in this stage</option>
                  ) : (
                    availableFormatsForStage.map((format) => (
                      <option key={format.name} value={format.name}>
                        {format.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
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
                
                <button
                  type="button"
                  onClick={handleDeleteFormat}
                  title="Delete format"
                  aria-label="Delete format"
                  disabled={!formData.format}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--border)',
                    background: formData.format ? '#fee2e2' : 'var(--surface)',
                    color: formData.format ? '#ef4444' : '#cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: formData.format ? 'pointer' : 'not-allowed',
                    flexShrink: 0,
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea
                className="form-textarea"
                placeholder={
                  hasSelectedStage && !hasFormatsForSelectedStage
                    ? 'Currently no message format in this stage. Click + to add format.'
                    : 'Enter WhatsApp message...'
                }
                value={formData.message}
                onChange={(event) => updateField('message', event.target.value)}
                disabled={hasSelectedStage && !hasFormatsForSelectedStage}
                style={{ minHeight: 150 }}
              />
              {hasSelectedStage && !hasFormatsForSelectedStage ? (
                <p style={{ margin: 0, color: 'var(--warning)', fontSize: 12, fontWeight: 600 }}>
                  Currently no message format in this stage. Click + to add format.
                </p>
              ) : selectedFormat && (
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

      {isAddingFormat && (
        <div className="modal-overlay" onClick={closeAddFormat}>
          <div
            className="modal-content"
            onClick={(event) => event.stopPropagation()}
            style={{ maxWidth: 720 }}
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-title">Add WhatsApp Format</span>
                <span className="modal-subtitle">Create a reusable message format for the dropdown</span>
              </div>
              <button type="button" className="modal-close-btn" onClick={closeAddFormat} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Format Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Repair Update"
                  value={newFormat.name}
                  onChange={(event) => setNewFormat((current) => ({ ...current, name: event.target.value }))}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  className="form-textarea"
                  placeholder="Enter format message..."
                  value={newFormat.message}
                  onChange={(event) => setNewFormat((current) => ({ ...current, message: event.target.value }))}
                  style={{ minHeight: 150 }}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
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
        </div>
      )}
    </div>
  );
};

export default WhatsAppMsgTab;
