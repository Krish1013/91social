import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBicyclePricing } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/format';

export function PricingBreakdown() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pricing,  setPricing]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    getBicyclePricing(id)
      .then(res => setPricing(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="hc-page"><LoadingSpinner message="Calculating pricing…" /></div>;
  if (error)   return (
    <div className="hc-page">
      <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '1.5rem', color: '#991b1b' }}>
        <strong>Error:</strong> {error}
        <br /><button className="hc-btn hc-btn-outline" style={{ marginTop: '1rem' }} onClick={() => navigate('/bicycles')}>← Back to Bicycles</button>
      </div>
    </div>
  );

  const { bicycle, breakdown, category_subtotals, grand_total, missing_prices, has_warnings } = pricing;

  return (
    <div className="hc-page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="hc-page-title">
            <i className="bi bi-calculator" style={{ marginRight: '0.5rem', color: 'var(--hc-orange)' }} />
            {bicycle.name}
          </h1>
          {bicycle.description && <p className="hc-page-subtitle">{bicycle.description}</p>}
          <p className="hc-page-subtitle" style={{ marginTop: '0.25rem' }}>
            Calculated: {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }} className="no-print">
          <button className="hc-btn hc-btn-outline" onClick={() => navigate(`/bicycles/${id}/build`)}>
            <i className="bi bi-tools" /> Edit Builder
          </button>
          <button className="hc-btn hc-btn-outline" onClick={() => navigate('/bicycles')}>
            <i className="bi bi-arrow-left" /> Back
          </button>
          <button className="hc-btn hc-btn-navy" onClick={() => window.print()}>
            <i className="bi bi-printer" /> Print
          </button>
        </div>
      </div>

      {/* Warning banner */}
      {has_warnings && missing_prices.length > 0 && (
        <div className="hc-warning-banner" style={{ marginBottom: '1rem' }}>
          <i className="bi bi-exclamation-triangle-fill" />
          <div>
            <strong>Price missing for:</strong> {missing_prices.join(', ')}. These components are excluded from the total.
          </div>
        </div>
      )}

      {/* Grand Total Hero */}
      <div className="pricing-grand-total" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div className="label">Grand Total ({breakdown.length} component{breakdown.length !== 1 ? 's' : ''})</div>
          <div className="amount">{formatCurrency(grand_total)}</div>
        </div>
        <i className="bi bi-bicycle" style={{ fontSize: '3rem', opacity: 0.3 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Breakdown table */}
        <div>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--hc-navy)', marginBottom: '0.75rem' }}>
            Component Breakdown
          </h2>

          {breakdown.length === 0 ? (
            <div className="hc-card">
              <div className="hc-empty">
                <div className="hc-empty-icon">🔩</div>
                <h3>No components in this bicycle</h3>
                <p>Go to the builder to add components.</p>
                <button className="hc-btn hc-btn-primary" onClick={() => navigate(`/bicycles/${id}/build`)}>
                  <i className="bi bi-tools" /> Open Builder
                </button>
              </div>
            </div>
          ) : (
            <div className="hc-table-wrap">
              <table className="hc-table">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Category</th>
                    <th>Unit Price</th>
                    <th>Qty</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map(item => (
                    <tr key={item.component_id} style={{ opacity: item.price_missing ? 0.6 : 1 }}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.component_name}</div>
                        {!item.is_active && <span className="hc-badge hc-badge-inactive" style={{ marginTop: '0.2rem', fontSize: '0.7rem' }}>Inactive</span>}
                        {item.price_missing && <span className="hc-badge hc-badge-warning" style={{ marginTop: '0.2rem', fontSize: '0.7rem' }}>No price set</span>}
                        {item.price_since && !item.price_missing && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--hc-slate)', marginTop: '0.15rem' }}>
                            Price since {formatDate(item.price_since)}
                          </div>
                        )}
                      </td>
                      <td><span className="hc-badge hc-badge-category">{item.category}</span></td>
                      <td>
                        {item.unit_price !== null
                          ? <span className="price-value">{formatCurrency(item.unit_price)}</span>
                          : <span style={{ color: 'var(--hc-warning)' }}>—</span>}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: 600 }}>×{item.quantity}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {item.line_total !== null
                          ? <span className="price-value">{formatCurrency(item.line_total)}</span>
                          : <span style={{ color: 'var(--hc-slate)' }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'right' }}>Grand Total</td>
                    <td style={{ textAlign: 'right', fontSize: '1.1rem', color: 'var(--hc-navy)' }}>
                      {formatCurrency(grand_total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Right sidebar: category subtotals */}
        <div>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--hc-navy)', marginBottom: '0.75rem' }}>
            By Category
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {category_subtotals.length === 0 ? (
              <p style={{ color: 'var(--hc-slate)', fontSize: '0.85rem' }}>No data yet.</p>
            ) : (
              <>
                {category_subtotals.map(cat => {
                  const pct = grand_total > 0 ? (cat.subtotal / grand_total) * 100 : 0;
                  return (
                    <div key={cat.category} style={{ background: 'var(--hc-white)', border: '1px solid var(--hc-border)', borderRadius: '6px', padding: '0.75rem', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span className="hc-badge hc-badge-category">{cat.category}</span>
                        <span className="price-value" style={{ fontSize: '0.9rem' }}>{formatCurrency(cat.subtotal)}</span>
                      </div>
                      <div style={{ height: '4px', background: 'var(--hc-border)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--hc-orange)', borderRadius: '2px', transition: 'width 0.6s ease' }} />
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--hc-slate)', marginTop: '0.3rem', textAlign: 'right' }}>
                        {pct.toFixed(1)}% of total
                      </div>
                    </div>
                  );
                })}
                <div style={{ borderTop: '2px solid var(--hc-border)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, padding: '0.6rem 0' }}>
                  <span>Total</span>
                  <span className="price-value">{formatCurrency(grand_total)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
