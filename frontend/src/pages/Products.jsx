import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [cartMsg, setCartMsg] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let res;
      if (search) {
        res = await api.get(`/api/products/search?name=${search}&page=${currentPage}&size=10`);
      } else if (category || minPrice || maxPrice) {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        params.append('page', currentPage);
        params.append('size', 10);
        res = await api.get(`/api/products/filter?${params}`);
      } else {
        res = await api.get(`/api/products?page=${currentPage}&size=10`);
      }
      setProducts(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch {
      setProducts([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchProducts(); }, [currentPage]);

  const handleSearch = () => {
    if (currentPage === 0) {
      fetchProducts();
    } else {
      setCurrentPage(0);
    }
  };

  const addToCart = async (productId) => {
    try {
      await api.post(`/api/cart/add?productId=${productId}&quantity=1`);
      setCartMsg('Added to cart!');
      setTimeout(() => setCartMsg(''), 2000);
    } catch (err) {
      setCartMsg(err.response?.data?.message || 'Failed to add');
      setTimeout(() => setCartMsg(''), 2000);
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Products</h1>
        {cartMsg && (
          <span style={{
            backgroundColor: cartMsg.includes('Added') ? 'var(--success)' : 'var(--error)',
            color: 'white', padding: '8px 16px', borderRadius: '6px', fontSize: '13px'
          }}>
            {cartMsg}
          </span>
        )}
      </div>

      {/* Search and Filter */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={labelStyle}>Search by name</label>
            <input placeholder="e.g. Headphones" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <input placeholder="e.g. Electronics" value={category} onChange={e => setCategory(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Min Price</label>
            <input type="number" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Max Price</label>
            <input type="number" placeholder="99999" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={handleSearch}>Search</button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="loading">No products found.</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '20px'
        }}>
          {products.map(product => (
            <div key={product.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              {product.imageUrl && (
                <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate(`/product/${product.id}`)}>
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px', marginBottom: '12px' }}
                    onError={e => e.target.style.display = 'none'}
                  />
                  {product.discount > 0 && (
                    <span style={{
                      position: 'absolute', top: '8px', left: '8px',
                      backgroundColor: 'var(--error)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      {product.discount}% OFF
                    </span>
                  )}
                </div>
              )}
              <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/product/${product.id}`)}>
                <span style={{
                  fontSize: '11px', fontWeight: '700', color: 'var(--accent)',
                  textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>
                  {product.category}
                </span>
                <h3 style={{ margin: '6px 0', fontSize: '16px', color: '#222' }}>{product.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ color: '#FFD700', fontSize: '14px' }}>
                    {'★'.repeat(Math.round(product.rating || 0))}
                  </span>
                  <span style={{ fontSize: '12px', color: '#666' }}>({product.rating?.toFixed(1) || '0.0'})</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
                  {product.description.length > 80 ? product.description.substring(0, 80) + '...' : product.description}
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>
                    ₹{product.price.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12px', color: product.stock > 0 ? 'var(--success)' : 'var(--error)' }}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </div>
                </div>
                <button
                  className="btn-accent"
                  onClick={() => addToCart(product.id)}
                  disabled={product.stock === 0}
                  style={{ fontSize: '13px', padding: '8px 16px' }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '30px', marginBottom: '20px' }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: currentPage === i ? 'var(--primary)' : '#eee',
                color: currentPage === i ? 'white' : '#333',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'background 0.2s'
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: '#555' };