import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/format';

export function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard()
      .then(res => setStats(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="hc-page"><LoadingSpinner message="Loading dashboard..." /></div>;
  if (error)   return <div className="hc-page"><div className="alert alert-danger">{error}</div></div>;

  const { total_components, total_bicycles, recent_price_updates } = stats;

  return (
    <div className="hc-page">
      {/* Hero banner */}
      <div className="hc-card" style={{ background: 'linear-gradient(135deg, var(--hc-navy) 0%, #2d4080 100%)', color: 'white', marginBottom: '1.75rem', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.4rem', color: 'white' }}>
              Welcome to Hero Cycles Pricing Engine
            </h1>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>
              Manage components, build bicycle configurations, and generate instant pricing breakdowns.
            </p>
          </div>
          <span style={{ fontSize: '3.5rem', opacity: 0.7 }}>🚲</span>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="hc-stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/components')}>
          <div className="hc-stat-icon orange"><i className="bi bi-puzzle-fill" /></div>
          <div>
            <div className="hc-stat-value">{total_components}</div>
            <div className="hc-stat-label">Active Components</div>
          </div>
        </div>
        <div className="hc-stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/bicycles')}>
          <div className="hc-stat-icon navy"><i className="bi bi-bicycle" /></div>
          <div>
            <div className="hc-stat-value">{total_bicycles}</div>
            <div className="hc-stat-label">Bicycle Configurations</div>
          </div>
        </div>
        <div className="hc-stat-card">
          <div className="hc-stat-icon green"><i className="bi bi-graph-up" /></div>
          <div>
            <div className="hc-stat-value">{recent_price_updates.length}</div>
            <div className="hc-stat-label">Recent Price Updates</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Recent Price Updates */}
        <div className="hc-card" style={{ gridColumn: 'span 1' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--hc-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="bi bi-clock-history" /> Recent Price Updates
          </h2>
          {recent_price_updates.length === 0 ? (
            <p style={{ color: 'var(--hc-slate)', fontSize: '0.875rem' }}>No price updates yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recent_price_updates.map(update => (
                <div key={update.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'var(--hc-bg)', borderRadius: '6px' }}>
                  <span className={`hc-badge hc-badge-category`} style={{ flexShrink: 0 }}>{update.category}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {update.component_name}
                    </div>
                    {update.notes && <div style={{ fontSize: '0.78rem', color: 'var(--hc-slate)' }}>{update.notes}</div>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div className="price-value" style={{ fontSize: '0.9rem' }}>{formatCurrency(update.price)}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--hc-slate)' }}>{formatDate(update.effective_date)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="hc-card">
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--hc-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="bi bi-lightning-charge" /> Quick Actions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { icon: 'bi-plus-circle', label: 'Add New Component',        desc: 'Add a part to the catalog',           path: '/components', state: { openAdd: true }, color: 'var(--hc-orange)' },
              { icon: 'bi-bicycle',     label: 'Build a Bicycle',           desc: 'Create a new configuration',          path: '/bicycles/new',                       color: 'var(--hc-navy)' },
              { icon: 'bi-list-ul',     label: 'View All Components',       desc: 'Browse the component catalog',        path: '/components',                         color: '#4338ca' },
              { icon: 'bi-bar-chart',   label: 'View All Configurations',   desc: 'See all bicycle builds',              path: '/bicycles',                           color: 'var(--hc-success)' },
            ].map((action) => (
              <button
                key={action.label}
                className="hc-btn hc-btn-outline"
                style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', gap: '0.75rem', height: 'auto' }}
                onClick={() => navigate(action.path, action.state ? { state: action.state } : undefined)}
              >
                <i className={`bi ${action.icon}`} style={{ fontSize: '1.1rem', color: action.color }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{action.label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--hc-slate)', fontWeight: 400 }}>{action.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
