import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await api.get('/api/cart');
      setCart(res.data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQuantity = async (productId, quantity) => {
    try {
      await api.put(`/api/cart/update?productId=${productId}&quantity=${quantity}`);
      fetchCart();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Update failed');
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete(`/api/cart/remove?productId=${productId}`);
      fetchCart();
    } catch {
      setMsg('Remove failed');
    }
  };

  const proceedToCheckout = () => {
    navigate('/checkout');
  };

  if (loading) return <div className="loading">Loading cart...</div>;

  return (
    <div className="page-container">
      <h1 className="page-title">Your Cart</h1>

      {msg && (
        <div style={{
          padding: '12px 16px', borderRadius: '6px', marginBottom: '20px',
          backgroundColor: msg.includes('success') ? '#e8f5e9' : '#fdecea',
          color: msg.includes('success') ? 'var(--success)' : 'var(--error)',
          fontWeight: '600', fontSize: '14px'
        }}>
          {msg}
        </div>
      )}

      {!cart || cart.items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: 'var(--secondary)', fontSize: '16px', marginBottom: '20px' }}>
            Your cart is empty
          </p>
          <button className="btn-primary" onClick={() => navigate('/products')}>
            Browse Products
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          {/* Cart Items */}
          <div>
            {cart.items.map(item => (
              <div key={item.id} className="card" style={{ marginBottom: '12px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                {item.productImageUrl && (
                  <img src={item.productImageUrl} alt={item.productName}
                    style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px' }}
                    onError={e => e.target.style.display = 'none'}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <h4 style={{ marginBottom: '4px' }}>{item.productName}</h4>
                  <p style={{ color: 'var(--secondary)', fontSize: '13px' }}>₹{item.productPrice.toLocaleString()} each</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    style={{ width: '30px', height: '30px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '16px' }}>
                    −
                  </button>
                  <span style={{ fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    style={{ width: '30px', height: '30px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '16px' }}>
                    +
                  </button>
                </div>
                <div style={{ fontWeight: '700', color: 'var(--primary)', minWidth: '90px', textAlign: 'right' }}>
                  ₹{item.subtotal.toLocaleString()}
                </div>
                <button className="btn-danger" onClick={() => removeItem(item.productId)}
                  style={{ padding: '6px 12px', fontSize: '12px' }}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div className="card">
              <h3 style={{ color: 'var(--primary)', marginBottom: '16px' }}>Order Summary</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span style={{ color: 'var(--secondary)' }}>Items ({cart.items.length})</span>
                <span>₹{cart.totalAmount.toLocaleString()}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '18px', marginBottom: '20px' }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }}>₹{cart.totalAmount.toLocaleString()}</span>
              </div>

              <button className="btn-accent" onClick={proceedToCheckout}
                style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}