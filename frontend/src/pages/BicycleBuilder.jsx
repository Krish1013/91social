import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBicycle, getComponents, addBicycleComponent, updateBicycleComponent, removeBicycleComponent } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PageHeader } from '../components/PageHeader';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/format';

export function BicycleBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bicycle,      setBicycle]     = useState(null);
  const [components,   setComponents]  = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [addForm,      setAddForm]     = useState({ category: '', component_id: '', quantity: 1 });
  const [addError,     setAddError]    = useState('');
  const [adding,       setAdding]      = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [liveTotal,    setLiveTotal]   = useState(0);
  const { toasts, success, error: toastError } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getBicycle(id), getComponents()])
      .then(([bikeRes, compRes]) => {
        setBicycle(bikeRes.data);
        setComponents(compRes.data);
      })
      .catch(err => toastError(err.message))
      .finally(() => setLoading(false));
  }, [id, toastError]);

  useEffect(() => { load(); }, [load]);

  // Recalculate live total whenever bicycle components change
  useEffect(() => {
    if (!bicycle) return;
    const total = bicycle.components.reduce((sum, bc) => {
      return sum + (bc.unit_price !== null ? bc.unit_price * bc.quantity : 0);
    }, 0);
    setLiveTotal(Math.round(total * 100) / 100);
  }, [bicycle]);

  // Unique categories from available components
  const categories = [...new Set(components.map(c => c.category))].sort();

  // Components filtered by selected category
  const filteredComponents = addForm.category
    ? components.filter(c => c.category === addForm.category)
    : components;

  async function handleAdd() {
    if (!addForm.component_id) { setAddError('Please select a component.'); return; }
    if (!addForm.quantity || addForm.quantity < 1) { setAddError('Quantity must be at least 1.'); return; }
    setAddError('');
    setAdding(true);
    try {
      await addBicycleComponent(id, {
        component_id: Number(addForm.component_id),
        quantity: Number(addForm.quantity)
      });
      success('Component added.');
      setAddForm(f => ({ ...f, component_id: '', quantity: 1 }));
      load();
    } catch (err) {
      toastError(err.message);
    } finally {
      setAdding(false);
    }
  }

  async function handleQtyChange(componentId, newQty) {
    if (newQty < 1) return;
    try {
      await updateBicycleComponent(id, componentId, { quantity: newQty });
      // Optimistic UI update
      setBicycle(b => ({
        ...b,
        components: b.components.map(bc =>
          bc.component_id === componentId ? { ...bc, quantity: newQty } : bc
        )
      }));
    } catch (err) {
      toastError(err.message);
    }
  }

  async function handleRemove(bc) {
    try {
      await removeBicycleComponent(id, bc.component_id);
      success(`"${bc.component_name}" removed.`);
      setRemoveTarget(null);
      load();
    } catch (err) {
      toastError(err.message);
    }
  }

  if (loading) return <div className="hc-page"><LoadingSpinner message="Loading bicycle builder…" /></div>;

  const usedIds = new Set((bicycle?.components || []).map(bc => bc.component_id));

  return (
    <div className="hc-page">
      <PageHeader
        title={`Builder: ${bicycle?.name}`}
        subtitle={bicycle?.description || 'Configure components and quantities'}
        action={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="hc-btn hc-btn-outline" onClick={() => navigate('/bicycles')}>
              <i className="bi bi-arrow-left" /> Back
            </button>
            <button
              className="hc-btn hc-btn-primary"
              onClick={() => navigate(`/bicycles/${id}/pricing`)}
              disabled={!bicycle?.components?.length}
            >
              <i className="bi bi-calculator" /> View Pricing
            </button>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: component table */}
        <div>
          <div className="hc-card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--hc-navy)', marginBottom: '1rem' }}>
              <i className="bi bi-list-check" style={{ marginRight: '0.4rem' }} />
              Selected Components ({bicycle?.components?.length || 0})
            </h3>

            {!bicycle?.components?.length ? (
              <div className="hc-empty" style={{ padding: '2rem 1rem' }}>
                <div className="hc-empty-icon">🔩</div>
                <h3>No components yet</h3>
                <p>Use the panel on the right to add components.</p>
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
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {bicycle.components.map(bc => (
                      <tr key={bc.component_id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{bc.component_name}</div>
                          {!bc.is_active && <span className="hc-badge hc-badge-inactive" style={{ marginTop: '0.2rem' }}>Inactive</span>}
                        </td>
                        <td><span className="hc-badge hc-badge-category">{bc.category}</span></td>
                        <td>
                          {bc.unit_price !== null
                            ? <span className="price-value">{formatCurrency(bc.unit_price)}</span>
                            : <span style={{ color: 'var(--hc-warning)', fontSize: '0.8rem' }}>⚠ No price</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <button
                              className="hc-btn hc-btn-outline hc-btn-sm"
                              style={{ padding: '0.15rem 0.45rem' }}
                              onClick={() => handleQtyChange(bc.component_id, bc.quantity - 1)}
                              disabled={bc.quantity <= 1}
                            >−</button>
                            <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 600 }}>{bc.quantity}</span>
                            <button
                              className="hc-btn hc-btn-outline hc-btn-sm"
                              style={{ padding: '0.15rem 0.45rem' }}
                              onClick={() => handleQtyChange(bc.component_id, bc.quantity + 1)}
                            >+</button>
                          </div>
                        </td>
                        <td>
                          {bc.unit_price !== null
                            ? <span className="price-value">{formatCurrency(bc.unit_price * bc.quantity)}</span>
                            : <span style={{ color: 'var(--hc-slate)' }}>—</span>}
                        </td>
                        <td>
                          <button className="hc-btn hc-btn-danger hc-btn-sm" onClick={() => setRemoveTarget(bc)}>
                            <i className="bi bi-trash" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700 }}>Live Total</td>
                      <td colSpan={2}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--hc-orange)' }}>
                          {formatCurrency(liveTotal)}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right: add component panel */}
        <div className="hc-card" style={{ position: 'sticky', top: '72px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--hc-navy)', marginBottom: '1rem' }}>
            <i className="bi bi-plus-circle" style={{ marginRight: '0.4rem' }} />
            Add Component
          </h3>

          <div className="hc-form-group">
            <label className="hc-label">Filter by Category</label>
            <select
              className="hc-select"
              value={addForm.category}
              onChange={e => setAddForm(f => ({ ...f, category: e.target.value, component_id: '' }))}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="hc-form-group">
            <label className="hc-label">Component *</label>
            <select
              className={`hc-select ${addError ? 'error' : ''}`}
              value={addForm.component_id}
              onChange={e => { setAddError(''); setAddForm(f => ({ ...f, component_id: e.target.value })); }}
            >
              <option value="">Select a component…</option>
              {filteredComponents.map(c => (
                <option key={c.id} value={c.id} disabled={usedIds.has(c.id)}>
                  {c.name} {c.current_price !== null ? `— ${formatCurrency(c.current_price)}` : '(no price)'}
                  {usedIds.has(c.id) ? ' ✓ Added' : ''}
                </option>
              ))}
            </select>
            {addError && <div className="hc-field-error">{addError}</div>}
          </div>

          <div className="hc-form-group">
            <label className="hc-label">Quantity</label>
            <input
              className="hc-input"
              type="number"
              min="1"
              value={addForm.quantity}
              onChange={e => setAddForm(f => ({ ...f, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
            />
          </div>

          <button className="hc-btn hc-btn-primary" style={{ width: '100%' }} onClick={handleAdd} disabled={adding}>
            {adding ? 'Adding…' : <><i className="bi bi-plus-lg" /> Add to Bicycle</>}
          </button>

          {/* Live total summary */}
          {bicycle?.components?.length > 0 && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--hc-orange-lt)', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--hc-slate)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Live Total</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--hc-orange)' }}>{formatCurrency(liveTotal)}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--hc-slate)' }}>{bicycle.components.length} component{bicycle.components.length !== 1 ? 's' : ''}</div>
            </div>
          )}
        </div>
      </div>

      {removeTarget && (
        <ConfirmDialog
          title="Remove Component"
          message={`Remove "${removeTarget.component_name}" from this bicycle?`}
          onConfirm={() => handleRemove(removeTarget)}
          onCancel={() => setRemoveTarget(null)}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  );
}
