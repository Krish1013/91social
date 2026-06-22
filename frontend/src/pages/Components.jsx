import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getComponents, createComponent, updateComponent, deleteComponent, getCategories } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PageHeader } from '../components/PageHeader';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { formatCurrency, formatDate } from '../utils/format';

const EMPTY_FORM = { name: '', category: '', description: '', initial_price: '' };

export function Components() {
  const [components, setComponents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = create mode
  const [form, setForm]           = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { toasts, success, error: toastError } = useToast();
  const navigate   = useNavigate();
  const location   = useLocation();

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getComponents(), getCategories()])
      .then(([compRes, catRes]) => {
        setComponents(compRes.data);
        setCategories(catRes.data);
      })
      .catch(err => toastError(err.message))
      .finally(() => setLoading(false));
  }, [toastError]);

  useEffect(() => { load(); }, [load]);

  // Support navigating here with openAdd state from Dashboard
  useEffect(() => {
    if (location.state?.openAdd) {
      openAdd();
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  }

  function openEdit(comp) {
    setEditTarget(comp);
    setForm({ name: comp.name, category: comp.category, description: comp.description || '', initial_price: '' });
    setFormErrors({});
    setShowModal(true);
  }

  function validate() {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    if (!form.category) errs.category = 'Please select a category.';
    if (!editTarget && form.initial_price !== '' && (isNaN(Number(form.initial_price)) || Number(form.initial_price) < 0)) {
      errs.initial_price = 'Price must be 0 or greater.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim() || undefined,
        ...((!editTarget && form.initial_price !== '') && { initial_price: Number(form.initial_price) })
      };
      if (editTarget) {
        await updateComponent(editTarget.id, payload);
        success('Component updated successfully.');
      } else {
        await createComponent(payload);
        success('Component created successfully.');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toastError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(comp) {
    try {
      await deleteComponent(comp.id);
      success(`"${comp.name}" deactivated.`);
      setConfirmDelete(null);
      load();
    } catch (err) {
      toastError(err.message);
    }
  }

  const filtered = components.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = !filterCat || c.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="hc-page">
      <PageHeader
        title="Components"
        subtitle={`${components.length} component${components.length !== 1 ? 's' : ''} in catalog`}
        action={
          <button className="hc-btn hc-btn-primary" onClick={openAdd}>
            <i className="bi bi-plus-lg" /> Add Component
          </button>
        }
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div className="hc-search" style={{ flex: '1 1 240px' }}>
          <i className="bi bi-search hc-search-icon" />
          <input
            className="hc-input"
            placeholder="Search components..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="hc-select" style={{ flex: '0 0 180px' }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <div className="hc-card">
          <EmptyState
            icon="🔩"
            title={search || filterCat ? 'No components match your filters' : 'No components yet'}
            message={search || filterCat ? 'Try clearing the search or filter.' : 'Add your first component to get started.'}
            action={!search && !filterCat && <button className="hc-btn hc-btn-primary" onClick={openAdd}><i className="bi bi-plus-lg" /> Add Component</button>}
          />
        </div>
      ) : (
        <div className="hc-table-wrap">
          <table className="hc-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Current Price</th>
                <th>Price Since</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(comp => (
                <tr key={comp.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{comp.name}</div>
                    {comp.description && <div style={{ fontSize: '0.78rem', color: 'var(--hc-slate)' }}>{comp.description}</div>}
                  </td>
                  <td><span className="hc-badge hc-badge-category">{comp.category}</span></td>
                  <td>
                    {comp.current_price !== null
                      ? <span className="price-value">{formatCurrency(comp.current_price)}</span>
                      : <span style={{ color: 'var(--hc-warning)', fontSize: '0.8rem' }}>⚠ No price set</span>}
                  </td>
                  <td style={{ color: 'var(--hc-slate)', fontSize: '0.82rem' }}>{formatDate(comp.price_since)}</td>
                  <td>
                    <span className={`hc-badge ${comp.is_active ? 'hc-badge-active' : 'hc-badge-inactive'}`}>
                      {comp.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="hc-btn hc-btn-outline hc-btn-sm" onClick={() => openEdit(comp)} title="Edit">
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="hc-btn hc-btn-outline hc-btn-sm" onClick={() => navigate(`/components/${comp.id}/prices`)} title="Price history">
                        <i className="bi bi-clock-history" />
                      </button>
                      {comp.is_active && (
                        <button className="hc-btn hc-btn-danger hc-btn-sm" onClick={() => setConfirmDelete(comp)} title="Deactivate">
                          <i className="bi bi-trash" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <Modal
          title={editTarget ? `Edit: ${editTarget.name}` : 'Add Component'}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="hc-btn hc-btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="hc-btn hc-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Create Component'}
              </button>
            </>
          }
        >
          <div className="hc-form-group">
            <label className="hc-label">Name *</label>
            <input
              className={`hc-input ${formErrors.name ? 'error' : ''}`}
              placeholder="e.g. Shimano Tourney 21-Speed"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            {formErrors.name && <div className="hc-field-error">{formErrors.name}</div>}
          </div>
          <div className="hc-form-group">
            <label className="hc-label">Category *</label>
            <select
              className={`hc-select ${formErrors.category ? 'error' : ''}`}
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            >
              <option value="">Select a category…</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {formErrors.category && <div className="hc-field-error">{formErrors.category}</div>}
          </div>
          <div className="hc-form-group">
            <label className="hc-label">Description</label>
            <textarea
              className="hc-textarea"
              rows={2}
              placeholder="Optional description…"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          {!editTarget && (
            <div className="hc-form-group">
              <label className="hc-label">Initial Price (₹)</label>
              <input
                className={`hc-input ${formErrors.initial_price ? 'error' : ''}`}
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 1200.00"
                value={form.initial_price}
                onChange={e => setForm(f => ({ ...f, initial_price: e.target.value }))}
              />
              {formErrors.initial_price && <div className="hc-field-error">{formErrors.initial_price}</div>}
              <div style={{ fontSize: '0.77rem', color: 'var(--hc-slate)', marginTop: '0.3rem' }}>
                You can set or update the price later from the price history page.
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <ConfirmDialog
          title="Deactivate Component"
          message={`Are you sure you want to deactivate "${confirmDelete.name}"? It will no longer appear in new bicycle configurations, but existing configurations will be preserved.`}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  );
}
