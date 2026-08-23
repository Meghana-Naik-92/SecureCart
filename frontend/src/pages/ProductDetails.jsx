import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartMsg, setCartMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/products/${id}`);
        setProduct(res.data);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setErrorMsg('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    try {
      await api.post(`/api/cart/add?productId=${product.id}&quantity=1`);
      setCartMsg('Added to cart!');
      setTimeout(() => setCartMsg(''), 2000);
    } catch (err) {
      setCartMsg(err.response?.data?.message || 'Failed to add');
      setTimeout(() => setCartMsg(''), 2000);
    }
  };

  if (loading) return <div className="page-container"><div className="loading">Loading product details...</div></div>;
  if (errorMsg) return <div className="page-container"><div style={{ color: 'var(--error)', textAlign: 'center', padding: '40px' }}>{errorMsg}</div></div>;
  if (!product) return <div className="page-container"><div style={{ color: 'var(--error)', textAlign: 'center', padding: '40px' }}>Product not found.</div></div>;

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/products')} 
        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginBottom: '20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}
      >
        ← Back to Products
      </button>

      {cartMsg && (
        <div style={{
          backgroundColor: cartMsg.includes('Added') ? 'var(--success)' : 'var(--error)',
          color: 'white', padding: '12px 16px', borderRadius: '6px', fontSize: '14px', marginBottom: '20px', textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {cartMsg}
        </div>
      )}

      <div className="card" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '40px', padding: '40px', alignItems: 'flex-start' }}>
        {/* Left Side: Image */}
        <div style={{ flex: '1 1 400px', minWidth: '300px' }}>
          {product.imageUrl ? (
            <div style={{ position: 'relative' }}>
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                style={{ width: '100%', height: 'auto', maxHeight: '500px', borderRadius: '12px', objectFit: 'contain', backgroundColor: '#fff', padding: '10px' }} 
              />
              {product.discount > 0 && (
                <span style={{
                  position: 'absolute', top: '10px', left: '10px',
                  backgroundColor: 'var(--error)', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {product.discount}% OFF
                </span>
              )}
            </div>
          ) : (
            <div style={{ width: '100%', height: '400px', backgroundColor: '#eee', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
              No Image
            </div>
          )}
        </div>

        {/* Right Side: Details */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {product.category}
            </span>
            <h1 style={{ margin: '12px 0 8px 0', fontSize: '32px', color: '#111', lineHeight: '1.2' }}>{product.name}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#FFD700', fontSize: '22px', letterSpacing: '2px' }}>
                {'★'.repeat(Math.round(product.rating || 0)) + '☆'.repeat(5 - Math.round(product.rating || 0))}
              </span>
              <span style={{ color: '#666', fontSize: '15px', fontWeight: '500' }}>{product.rating?.toFixed(1) || '0.0'} Rating</span>
            </div>
          </div>

          <p style={{ fontSize: '16px', color: '#444', lineHeight: '1.6', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '20px 0' }}>
            {product.description}
          </p>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px' }}>
            <div style={{ fontSize: '40px', fontWeight: '800', color: 'var(--primary)', lineHeight: '1' }}>
              ₹{product.price.toLocaleString()}
            </div>
            {product.discount > 0 && (
              <div style={{ fontSize: '20px', color: '#999', textDecoration: 'line-through', marginBottom: '6px' }}>
                ₹{Math.round(product.price / (1 - product.discount / 100)).toLocaleString()}
              </div>
            )}
          </div>

          <div style={{ fontSize: '15px', color: product.stock > 0 ? 'var(--success)' : 'var(--error)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>{product.stock > 0 ? '✓' : '✗'}</span>
            {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of stock'}
          </div>

          <div style={{ marginTop: '10px' }}>
            <button 
              className="btn-accent" 
              onClick={addToCart}
              disabled={product.stock === 0}
              style={{ width: '100%', padding: '16px', fontSize: '18px', fontWeight: 'bold', borderRadius: '8px', opacity: product.stock === 0 ? 0.5 : 1, transition: 'transform 0.2s, background 0.2s', cursor: product.stock === 0 ? 'not-allowed' : 'pointer' }}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
