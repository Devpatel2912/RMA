import React, { useState } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Plus, Tag, Check, X, FolderOpen, Search } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCategories } from '../api/hooks';
import Spinner, { SkeletonLoader } from './Spinner';

const CATEGORY_COLORS = [
  { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', dot: '#3b82f6' },
  { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', dot: '#22c55e' },
  { bg: '#fdf4ff', border: '#e9d5ff', text: '#7e22ce', dot: '#a855f7' },
  { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c', dot: '#f97316' },
  { bg: '#fdf2f8', border: '#fbcfe8', text: '#9d174d', dot: '#ec4899' },
  { bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1', dot: '#0ea5e9' },
  { bg: '#fefce8', border: '#fde68a', text: '#a16207', dot: '#eab308' },
  { bg: '#fff1f2', border: '#fecdd3', text: '#be123c', dot: '#f43f5e' },
];

export default function ManageCategoriesTab({ userRole }) {
  const queryClient = useQueryClient();
  const { data: fullCategories = [], isLoading } = useCategories();
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const filtered = fullCategories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    if (!newCategoryName.trim()) return;
    setIsAdding(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
      await axios.post(`${baseUrl}/categories`, { name: newCategoryName.trim() });
      setNewCategoryName('');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (err) {
      alert('Failed to add category. Note: Only Admins can add categories.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    setDeletingId(id);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
      await axios.delete(`${baseUrl}/categories/${id}`);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to delete category.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
      await axios.put(`${baseUrl}/categories/${id}`, { name: editName.trim() });
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (err) {
      alert('Failed to update category.');
    }
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 4px' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
            <Tag size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Manage Categories</h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Organise product types for your RMA workflow.</p>
          </div>
        </div>
      </div>

      {/* ── Add Category Card ── */}
      {userRole === 'ADMIN' && (
        <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%)', border: '1px solid #c7d2fe', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            + New Category
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Tag size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="e.g. Motherboard, GPU, RAM..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                style={{
                  width: '100%', padding: '11px 14px 11px 36px', fontSize: '14px',
                  border: '1.5px solid #c7d2fe', borderRadius: '10px', outline: 'none',
                  backgroundColor: 'white', color: '#0f172a', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = '#c7d2fe'}
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={isAdding || !newCategoryName.trim()}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '11px 22px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: isAdding || !newCategoryName.trim()
                  ? '#e2e8f0'
                  : 'linear-gradient(135deg,#4f46e5,#6366f1)',
                color: isAdding || !newCategoryName.trim() ? '#94a3b8' : 'white',
                fontWeight: 600, fontSize: '14px',
                boxShadow: isAdding || !newCategoryName.trim() ? 'none' : '0 4px 12px rgba(99,102,241,0.35)',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
            >
              {isAdding ? <Spinner size="xs" variant="white" /> : <Plus size={16} />}
              Add Category
            </button>
          </div>
        </div>
      )}

      {/* ── Categories Card ── */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>

        {/* Search + count bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: '#fafbfc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderOpen size={16} color="#6366f1" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
              All Categories
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6366f1', background: '#eef2ff', padding: '2px 9px', borderRadius: '20px' }}>
              {fullCategories.length}
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                padding: '7px 12px 7px 30px', fontSize: '13px', border: '1px solid #e2e8f0',
                borderRadius: '8px', outline: 'none', backgroundColor: 'white', width: '180px',
              }}
            />
          </div>
        </div>

        {/* List body */}
        {isLoading ? (
          <SkeletonLoader rows={6} />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
            <Tag size={36} color="#e2e8f0" style={{ marginBottom: '12px' }} />
            <p style={{ margin: 0, fontSize: '14px' }}>
              {searchTerm ? 'No categories match your search.' : 'No categories yet. Add one above!'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', padding: '12px' }}>
            {filtered.map((cat, idx) => {
              const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
              const isEditing = editingId === cat.id;
              const isDeleting = deletingId === cat.id;

              return (
                <div
                  key={cat.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    background: isEditing ? '#eef2ff' : 'transparent',
                    transition: 'background-color 0.2s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => { if (!isEditing) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                  onMouseLeave={e => { if (!isEditing) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {/* Subtle color dot on the left */}
                  <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '4px', height: '60%', background: color.dot, borderRadius: '0 4px 4px 0', opacity: isEditing ? 1 : 0.6 }} />

                  {isEditing ? (
                    <div style={{ display: 'flex', flex: 1, gap: '16px', alignItems: 'center', marginLeft: '12px' }}>
                      <input
                        autoFocus
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleUpdate(cat.id)}
                        style={{
                          flex: 1, maxWidth: '400px', padding: '8px 12px', fontSize: '14px', fontWeight: 500,
                          border: '1.5px solid #6366f1', borderRadius: '8px', outline: 'none',
                          backgroundColor: 'white', color: '#0f172a',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleUpdate(cat.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}
                        >
                          <Check size={14} /> Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: color.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Tag size={16} color={color.dot} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>{cat.name}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Product Category</p>
                        </div>
                      </div>

                      {userRole === 'ADMIN' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                            title="Edit"
                            style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: `1px solid #e2e8f0`, borderRadius: '8px', cursor: 'pointer', color: '#64748b', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.borderColor = '#bfdbfe'; e.currentTarget.style.background = '#eff6ff'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; }}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            disabled={isDeleting}
                            title="Delete"
                            style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', color: '#64748b', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fecaca'; e.currentTarget.style.background = '#fef2f2'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; }}
                          >
                            {isDeleting ? <Spinner size="xs" variant="muted" /> : <Trash2 size={15} />}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
