import React, { useState } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Plus, Tag, Check, X, FolderOpen, Search } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCategories } from '../api/hooks';
import Spinner, { SkeletonLoader } from './Spinner';

const CATEGORY_COLORS = [
  { bg: 'rgba(4,120,87,0.08)',   dot: '#10b981' },
  { bg: 'rgba(34,197,94,0.08)',   dot: '#22C55E' },
  { bg: 'rgba(139,92,246,0.08)', dot: '#8B5CF6' },
  { bg: 'rgba(245,158,11,0.08)', dot: '#F59E0B' },
  { bg: 'rgba(236,72,153,0.08)', dot: '#EC4899' },
  { bg: 'rgba(6,182,212,0.08)',  dot: '#06B6D4' },
  { bg: 'rgba(239,68,68,0.08)',  dot: '#EF4444' },
  { bg: 'rgba(16,185,129,0.08)', dot: '#10B981' },
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
    <div style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div className="header" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--primary), #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'none',
          }}>
            <Tag size={20} color="#fff" />
          </div>
          <div>
            <h1 className="page-title" style={{ fontSize: 22 }}>Manage Categories</h1>
            <p className="page-subtitle">Organise product types for your RMA workflow</p>
          </div>
        </div>
      </div>

      {/* ── Add Category ── */}
      {userRole === 'ADMIN' && (
        <div style={{
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginBottom: 20,
          boxShadow: 'none',
        }}>
          <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Add New Category
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Tag size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="e.g. Motherboard, GPU, RAM..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="form-input"
                style={{ paddingLeft: 36 }}
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={isAdding || !newCategoryName.trim()}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 22px', borderRadius: 'var(--radius-sm)',
                border: 'none', cursor: isAdding || !newCategoryName.trim() ? 'not-allowed' : 'pointer',
                background: isAdding || !newCategoryName.trim()
                  ? 'var(--border)'
                  : 'linear-gradient(135deg, var(--primary), #059669)',
                color: isAdding || !newCategoryName.trim() ? 'var(--text-muted)' : 'white',
                fontWeight: 700, fontSize: 13.5,
                boxShadow: isAdding || !newCategoryName.trim() ? 'none' : '0 4px 12px rgba(4,120,87,0.35)',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {isAdding ? <Spinner size="xs" variant="white" /> : <Plus size={16} />}
              Add Category
            </button>
          </div>
        </div>
      )}

      {/* ── Categories Card ── */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: 'none',
      }}>

        {/* Search + count bar */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, background: 'var(--surface-hover)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FolderOpen size={16} color="var(--primary)" />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              All Categories
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--primary)',
              background: 'var(--primary-light)', padding: '2px 10px', borderRadius: 99,
            }}>
              {fullCategories.length}
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                padding: '7px 12px 7px 30px', fontSize: 13,
                border: '1.5px solid var(--border)', borderRadius: 8,
                outline: 'none', background: 'var(--surface)',
                color: 'var(--text-primary)', width: 180,
                fontFamily: 'Inter, sans-serif',
              }}
            />
          </div>
        </div>

        {/* List body */}
        {isLoading ? (
          <SkeletonLoader rows={6} />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
            <Tag size={32} color="var(--border)" style={{ marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontSize: 14 }}>
              {searchTerm ? 'No categories match your search.' : 'No categories yet. Add one above!'}
            </p>
          </div>
        ) : (
          <div>
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
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border)',
                    background: isEditing ? 'var(--primary-light)' : 'transparent',
                    transition: 'background-color 0.15s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => { if (!isEditing) e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                  onMouseLeave={e => { if (!isEditing) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {/* Left color accent */}
                  <div style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: 3, background: color.dot, borderRadius: '0 2px 2px 0',
                  }} />

                  {isEditing ? (
                    <div style={{ display: 'flex', flex: 1, gap: 12, alignItems: 'center', marginLeft: 14 }}>
                      <input
                        autoFocus
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleUpdate(cat.id)}
                        className="form-input"
                        style={{ flex: 1, maxWidth: 400 }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleUpdate(cat.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 16px', background: 'var(--primary)',
                            color: 'white', border: 'none', borderRadius: 8,
                            fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          <Check size={14} /> Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 16px', background: 'var(--surface-hover)',
                            color: 'var(--text-secondary)', border: '1px solid var(--border)',
                            borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginLeft: 14 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: color.bg, display: 'flex',
                          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <Tag size={16} color={color.dot} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</p>
                          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Product Category</p>
                        </div>
                      </div>

                      {userRole === 'ADMIN' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                            title="Edit"
                            style={{
                              width: 34, height: 34, display: 'flex', alignItems: 'center',
                              justifyContent: 'center', background: 'var(--surface)',
                              border: '1px solid var(--border)', borderRadius: 8,
                              cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.color = 'var(--primary)';
                              e.currentTarget.style.borderColor = 'var(--primary)';
                              e.currentTarget.style.background = 'var(--primary-light)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.color = 'var(--text-muted)';
                              e.currentTarget.style.borderColor = 'var(--border)';
                              e.currentTarget.style.background = 'var(--surface)';
                            }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            disabled={isDeleting}
                            title="Delete"
                            style={{
                              width: 34, height: 34, display: 'flex', alignItems: 'center',
                              justifyContent: 'center', background: 'var(--surface)',
                              border: '1px solid var(--border)', borderRadius: 8,
                              cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.color = 'var(--error)';
                              e.currentTarget.style.borderColor = 'var(--error-border)';
                              e.currentTarget.style.background = 'var(--error-light)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.color = 'var(--text-muted)';
                              e.currentTarget.style.borderColor = 'var(--border)';
                              e.currentTarget.style.background = 'var(--surface)';
                            }}
                          >
                            {isDeleting ? <Spinner size="xs" variant="muted" /> : <Trash2 size={14} />}
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
