import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      backgroundColor: 'var(--primary)',
      padding: '0 30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '60px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <Link to="/products" style={{
        color: 'white',
        textDecoration: 'none',
        fontSize: '20px',
        fontWeight: '700',
        letterSpacing: '0.5px'
      }}>
        🛒 SecureCart
      </Link>

      {user && (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/products" style={navLink}>Products</Link>
          <Link to="/cart" style={navLink}>Cart</Link>
          <Link to="/orders" style={navLink}>My Orders</Link>
          {isAdmin && (
            <Link to="/admin/products" style={{
              ...navLink,
              backgroundColor: 'var(--accent)',
              padding: '6px 14px',
              borderRadius: '6px'
            }}>
              Admin
            </Link>
          )}
          <span style={{ color: '#ccc', fontSize: '13px' }}>
            {user.email}
          </span>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              border: '1.5px solid rgba(255,255,255,0.5)',
              color: 'white',
              padding: '6px 14px',
              fontSize: '13px'
            }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

const navLink = {
  color: 'rgba(255,255,255,0.85)',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'color 0.2s'
};