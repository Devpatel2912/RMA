import React, { useState } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCategories } from '../api/hooks';

export default function ManageCategoriesTab({ newCategoryName, setNewCategoryName, userRole }) {
  const queryClient = useQueryClient();
  const { data: fullCategories = [], isLoading } = useCategories();
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');



  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        await axios.delete(`${baseUrl}/categories/${id}`);
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      } catch (err) {
        if (err.response && err.response.data && err.response.data.error) {
          alert(err.response.data.error);
        } else {
          alert("Failed to delete category.");
        }
      }
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      await axios.put(`${baseUrl}/categories/${id}`, { name: editName.trim() });
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (err) {
      alert("Failed to update category.");
    }
  };

  return (
    <>
      <div className="header">
        <div className="header-text">
          <h1 className="page-title">Manage Categories</h1>
          <p className="page-subtitle">Add and view product categories.</p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
          <Loader2 className="lucide-spin" size={32} color="#64748b" />
        </div>
      ) : (

      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Enter new category name..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            style={{ flex: 1 }}
          />
          <button 
            className="btn-save" 
            onClick={async () => {
              if (newCategoryName.trim()) {
                try {
                  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                  await axios.post(`${baseUrl}/categories`, { name: newCategoryName.trim() });
                  setNewCategoryName('');
                  queryClient.invalidateQueries({ queryKey: ['categories'] });
                } catch (err) {
                  alert("Failed to add category. Note: Only Admins can add categories.");
                }
              }
            }}
            style={{ padding: '0 24px', height: 'auto' }}
          >
            Add Category
          </button>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {fullCategories.map((cat) => (
            <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>
              {editingId === cat.id ? (
                <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                  <input type="text" className="form-input" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: '4px 8px' }} />
                  <button className="btn-save" style={{ padding: '4px 12px' }} onClick={() => handleUpdate(cat.id)}>Save</button>
                  <button className="btn-cancel" style={{ padding: '4px 12px' }} onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              ) : (
                <>
                  <span>{cat.name}</span>
                  {userRole === 'ADMIN' && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      )}
    </>
  );
}
