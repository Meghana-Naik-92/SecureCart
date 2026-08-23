import { useState, useEffect } from 'react';
import api from '../../api/axios';

const emptyForm = { name: '', description: '', price: '', stock: '', category: '', imageUrl: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/products');
      setProducts(res.data.content || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/api/products/${editId}`, form);
        showMsg('Product updated successfully');
      } else {
        await api.post('/api/products', form);
        showMsg('Product created successfully');
      }
      setForm(emptyForm);
      setEditId(null);
      fetchProducts();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (product) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category: product.category,
      imageUrl: product.imageUrl || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      showMsg('Product deleted');
      fetchProducts();
    } catch {
      showMsg('Delete failed');
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Admin — Products</h1>

      {msg && (
        <div style={{
          padding: '12px 16px', borderRadius: '6px', marginBottom: '20px',
          backgroundColor: msg.includes('success') || msg.includes('deleted') ? '#e8f5e9' : '#fdecea',
          color: msg.includes('success') || msg.includes('deleted') ? 'var(--success)' : 'var(--error)',
          fontWeight: '600', fontSize: '14px'
        }}>
          {msg}
        </div>
      )}

      {/* Form */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <h3 style={{ color: 'var(--primary)', marginBottom: '20px' }}>
          {editId ? 'Edit Product' : 'Add New Product'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Product Name *</label>
              <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label style={labelStyle}>Category *</label>
              <input placeholder="e.g. Electronics" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
            </div>
            <div>
              <label style={labelStyle}>Price *</label>
              <input type="number" placeholder="0.00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div>
              <label style={labelStyle}>Stock *</label>
              <input type="number" placeholder="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
            </div>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Image URL</label>
            <input placeholder="https://..." value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Description</label>
            <textarea rows={3} placeholder="Product description" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn-primary">
              {editId ? 'Update Product' : 'Add Product'}
            </button>
            {editId && (
              <button type="button" className="btn-outline" onClick={() => { setForm(emptyForm); setEditId(null); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Products Table */}
      {loading ? <div className="loading">Loading...</div> : (
        <div className="card">
          <h3 style={{ color: 'var(--primary)', marginBottom: '16px' }}>
            All Products ({products.length})
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['Name', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--secondary)', fontWeight: '600' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: '500' }}>{p.name}</td>
                  <td style={{ padding: '12px 8px', color: 'var(--secondary)' }}>{p.category}</td>
                  <td style={{ padding: '12px 8px' }}>₹{p.price.toLocaleString()}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{ color: p.stock > 0 ? 'var(--success)' : 'var(--error)', fontWeight: '600' }}>
                      {p.stock}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <button className="btn-outline" onClick={() => handleEdit(p)}
                      style={{ fontSize: '12px', padding: '5px 12px', marginRight: '8px' }}>
                      Edit
                    </button>
                    <button className="btn-danger" onClick={() => handleDelete(p.id)}
                      style={{ fontSize: '12px', padding: '5px 12px' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#444' };