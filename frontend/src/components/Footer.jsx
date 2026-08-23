export default function Footer() {
  return (
    <footer style={{
      width: '100%',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: 'var(--bg)',
      color: 'var(--secondary)',
      fontSize: '13px',
      borderTop: '1px solid var(--border)',
      marginTop: 'auto' // this ensures it pushes to bottom if container is flex col
    }}>
      <p style={{ margin: 0, fontWeight: '500', letterSpacing: '0.5px' }}>
        COPYRIGHT &copy; 2026 MEGHANAMNAIK. ALL RIGHTS RESERVED.
      </p>
    </footer>
  );
}
