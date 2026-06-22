import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComponent, getPriceHistory, addPrice } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { formatCurrency, formatDateTime } from '../utils/format';

export function PriceHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [component, setComponent] = useState(null);
  const [history,   setHistory]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState({ price: '', notes: '' });
  const [formErrors, setFormErrors] = useState({});
  const [saving,    setSaving]    = useState(false);
  const { toasts, success, error: toastError } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getComponent(id), getPriceHistory(id)])
      .then(([compRes, histRes]) => {
        setComponent(compRes.data);
        setHistory(histRes.data);
      })
      .catch(err => toastError(err.message))
      .finally(() => setLoading(false));
  }, [id, toastError]);

  useEffect(() => { load(); }, [load]);

  function validate() {
    const errs = {};
    const p = Number(form.price);
    if (form.price === '' || isNaN(p)) errs.price = 'Please enter a valid price.';
    else if (p < 0) errs.price = 'Price must be 0 or greater.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleAddPrice() {
    if (!validate()) return;
    setSaving(true);
    try {
      await addPrice(id, { price: Number(form.price), notes: form.notes.trim() || undefined });
      success('Price added successfully.');
      setShowModal(false);
      setForm({ price: '', notes: '' });
      load();
    } catch (err) {
      toastError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="hc-page"><LoadingSpinner /></div>;

  return (
    <div className="hc-page">
      <PageHeader
        title={`Price History: ${component?.name}`}
        subtitle={component ? `${component.category} · ${history.length} price entr${history.length !== 1 ? 'ies' : 'y'}` : ''}
        action={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="hc-btn hc-btn-outline" onClick={() => navigate('/components')}>
              <i className="bi bi-arrow-left" /> Back
            </button>
            <button className="hc-btn hc-btn-primary" onClick={() => { setForm({ price: '', notes: '' }); setFormErrors({}); setShowModal(true); }}>
              <i className="bi bi-plus-lg" /> Add Price
            </button>
          </div>
        }
      />

      {/* Current price hero */}
      {component && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="hc-stat-card">
            <div className="hc-stat-icon orange"><i className="bi bi-currency-rupee" /></div>
            <div>
              <div className="hc-stat-value" style={{ fontSize: '1.4rem' }}>
                {component.current_price !== null ? formatCurrency(component.current_price) : '—'}
              </div>
              <div className="hc-stat-label">Current Price</div>
            </div>
          </div>
          <div className="hc-stat-card">
            <div className="hc-stat-icon navy"><i className="bi bi-tag" /></div>
            <div>
              <div className="hc-stat-value" style={{ fontSize: '1.1rem' }}>{component.category}</div>
              <div className="hc-stat-label">Category</div>
            </div>
          </div>
          <div className="hc-stat-card">
            <div className="hc-stat-icon green"><i className="bi bi-list-ol" /></div>
            <div>
              <div className="hc-stat-value">{history.length}</div>
              <div className="hc-stat-label">Total Entries</div>
            </div>
          </div>
        </div>
      )}

      {/* History table */}
      {history.length === 0 ? (
        <div className="hc-card">
          <div className="hc-empty">
            <div className="hc-empty-icon">💰</div>
            <h3>No price history yet</h3>
            <p>Add the first price for this component.</p>
            <button className="hc-btn hc-btn-primary" onClick={() => setShowModal(true)}>
              <i className="bi bi-plus-lg" /> Add First Price
            </button>
          </div>
        </div>
      ) : (
        <div className="hc-table-wrap">
          <table className="hc-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Price</th>
                <th>Effective Date</th>
                <th>Notes</th>
                <th>Recorded At</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry, index) => (
                <tr key={entry.id}>
                  <td>
                    {index === 0 && (
                      <span className="hc-badge hc-badge-active" style={{ marginRight: '0.5rem' }}>Latest</span>
                    )}
                    <span style={{ color: 'var(--hc-slate)', fontSize: '0.8rem' }}>#{entry.id}</span>
                  </td>
                  <td>
                    <span className="price-value" style={{ fontSize: index === 0 ? '1.05rem' : '0.9rem' }}>
                      {formatCurrency(entry.price)}
                    </span>
                    {index > 0 && history[index - 1] && (
                      <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', color: entry.price > history[index - 1].price ? 'var(--hc-success)' : 'var(--hc-danger)' }}>
                        {/* price change direction shown relative to next newer entry */}
                      </span>
                    )}
                  </td>
                  <td style={{ fontWeight: index === 0 ? 600 : 400 }}>{formatDateTime(entry.effective_date)}</td>
                  <td style={{ color: 'var(--hc-slate)', maxWidth: '220px' }}>
                    {entry.notes || <span style={{ opacity: 0.4 }}>—</span>}
                  </td>
                  <td style={{ color: 'var(--hc-slate)', fontSize: '0.8rem' }}>{formatDateTime(entry.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Timeline visualization for multiple entries */}
      {history.length > 1 && (
        <div className="hc-card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--hc-navy)', marginBottom: '1rem' }}>
            Price Timeline
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[...history].reverse().map((entry, index, arr) => (
              <div key={entry.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                {/* Timeline line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px', flexShrink: 0 }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: index === arr.length - 1 ? 'var(--hc-orange)' : 'var(--hc-border)', border: '2px solid', borderColor: index === arr.length - 1 ? 'var(--hc-orange)' : '#cbd5e1', marginTop: '4px' }} />
                  {index < arr.length - 1 && <div style={{ width: '2px', flex: 1, minHeight: '32px', background: 'var(--hc-border)' }} />}
                </div>
                {/* Content */}
                <div style={{ paddingBottom: index < arr.length - 1 ? '1rem' : 0, flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span className="price-value">{formatCurrency(entry.price)}</span>
                      {index > 0 && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.78rem', color: entry.price >= arr[index - 1].price ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                          {entry.price >= arr[index - 1].price ? '▲' : '▼'} {formatCurrency(Math.abs(entry.price - arr[index - 1].price))}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--hc-slate)' }}>{formatDateTime(entry.effective_date)}</span>
                  </div>
                  {entry.notes && <div style={{ fontSize: '0.8rem', color: 'var(--hc-slate)', marginTop: '0.2rem' }}>{entry.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Price Modal */}
      {showModal && (
        <Modal
          title="Add New Price"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="hc-btn hc-btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="hc-btn hc-btn-primary" onClick={handleAddPrice} disabled={saving}>
                {saving ? 'Saving…' : 'Add Price'}
              </button>
            </>
          }
        >
          <div style={{ background: 'var(--hc-bg)', borderRadius: '6px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            <strong>Current price:</strong> {component?.current_price !== null ? formatCurrency(component.current_price) : 'Not set'}
          </div>
          <div className="hc-form-group">
            <label className="hc-label">New Price (₹) *</label>
            <input
              className={`hc-input ${formErrors.price ? 'error' : ''}`}
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 1350.00"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              autoFocus
            />
            {formErrors.price && <div className="hc-field-error">{formErrors.price}</div>}
          </div>
          <div className="hc-form-group">
            <label className="hc-label">Notes (optional)</label>
            <input
              className="hc-input"
              placeholder="e.g. Supplier rate revision Q3 2025"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--hc-slate)', background: 'var(--hc-orange-lt)', padding: '0.6rem 0.75rem', borderRadius: '6px' }}>
            <i className="bi bi-info-circle" style={{ marginRight: '0.35rem' }} />
            Prices are append-only. The previous price is preserved in history forever.
          </div>
        </Modal>
      )}

      <Toast toasts={toasts} />
    </div>
  );
}
