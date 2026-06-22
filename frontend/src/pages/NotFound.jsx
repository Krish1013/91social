import { useNavigate } from 'react-router-dom';

export function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="hc-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🚲</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--hc-navy)', marginBottom: '0.5rem' }}>404</h1>
      <p style={{ color: 'var(--hc-slate)', marginBottom: '1.5rem' }}>This page has gone for a ride and can't be found.</p>
      <button className="hc-btn hc-btn-primary hc-btn-lg" onClick={() => navigate('/')}>
        <i className="bi bi-house" /> Go Home
      </button>
    </div>
  );
}
