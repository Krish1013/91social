import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBicycles, createBicycle, updateBicycle, deleteBicycle } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PageHeader } from '../components/PageHeader';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../utils/format';

const EMPTY_FORM = { name: '', description: '' };

export function Bicycles() {
  const [bicycles, setBicycles]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form,     setForm]       = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving,   setSaving]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { toasts, success, error: toastError } = useToast();
  const navigate = useNavigate();

  const load = useCallback(() => {
    setLoading(true);
    getBicycles()
      .then(res => setBicycles(res.data))
      .catch(err => toastError(err.message))
      .finally(() => setLoading(false));
  }, [toastError]);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  }

  function openEdit(bike) {
    setEditTarget(bike);
    setForm({ name: bike.name, description: bike.description || '' });
    setFormErrors({});
    setShowModal(true);
  }

  function validate() {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), description: form.description.trim() || undefined };
      if (editTarget) {
        await updateBicycle(editTarget.id, payload);
        success('Bicycle updated.');
      } else {
        const res = await createBicycle(payload);
        success('Bicycle created! Now add components.');
        setShowModal(false);
        navigate(`/bicycles/${res.data.id}/build`);
        return;
      }
      setShowModal(false);
      load();
    } catch (err) {
      toastError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(bike) {
    try {
      await deleteBicycle(bike.id);
      success(`"${bike.name}" deleted.`);
      setConfirmDelete(null);
      load();
    } catch (err) {
      toastError(err.message);
    }
  }

  return (
    <div className="hc-page">
      <PageHeader
        title="Bicycle Configurations"
        subtitle={`${bicycles.length} configuration${bicycles.length !== 1 ? 's' : ''}`}
        action={
          <button className="hc-btn hc-btn-primary" onClick={openAdd}>
            <i className="bi bi-plus-lg" /> New Bicycle
          </button>
        }
      />

      {loading ? <LoadingSpinner /> : bicycles.length === 0 ? (
        <div className="hc-card">
          <EmptyState
            icon="🚲"
            title="No bicycles yet"
            message="Create your first bicycle configuration to generate a pricing breakdown."
            action={<button className="hc-btn hc-btn-primary" onClick={openAdd}><i className="bi bi-plus-lg" /> New Bicycle</button>}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {bicycles.map(bike => (
            <div key={bike.id} className="hc-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--hc-navy)' }}>{bike.name}</div>
                  {bike.description && <div style={{ fontSize: '0.82rem', color: 'var(--hc-slate)', marginTop: '0.2rem' }}>{bike.description}</div>}
                </div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button className="hc-btn hc-btn-outline hc-btn-sm" onClick={() => openEdit(bike)} title="Edit name">
                    <i className="bi bi-pencil" />
                  </button>
                  <button className="hc-btn hc-btn-danger hc-btn-sm" onClick={() => setConfirmDelete(bike)} title="Delete">
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="hc-badge hc-badge-category">
                  <i className="bi bi-puzzle" style={{ marginRight: '0.3rem' }} />
                  {bike.component_count} component{bike.component_count !== 1 ? 's' : ''}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--hc-slate)', display: 'flex', alignItems: 'center' }}>
                  Created {formatDate(bike.created_at)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <button className="hc-btn hc-btn-outline" style={{ flex: 1 }} onClick={() => navigate(`/bicycles/${bike.id}/build`)}>
                  <i className="bi bi-tools" /> Builder
                </button>
                <button className="hc-btn hc-btn-primary" style={{ flex: 1 }} onClick={() => navigate(`/bicycles/${bike.id}/pricing`)}>
                  <i className="bi bi-calculator" /> Pricing
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title={editTarget ? `Edit: ${editTarget.name}` : 'New Bicycle Configuration'}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="hc-btn hc-btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="hc-btn hc-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Create & Configure'}
              </button>
            </>
          }
        >
          <div className="hc-form-group">
            <label className="hc-label">Bicycle Name *</label>
            <input
              className={`hc-input ${formErrors.name ? 'error' : ''}`}
              placeholder="e.g. Hero Sprint 26"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              autoFocus
            />
            {formErrors.name && <div className="hc-field-error">{formErrors.name}</div>}
          </div>
          <div className="hc-form-group">
            <label className="hc-label">Description</label>
            <textarea
              className="hc-textarea"
              rows={2}
              placeholder="e.g. Entry-level road bike for city commuting"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          {!editTarget && (
            <div style={{ fontSize: '0.8rem', color: 'var(--hc-slate)', background: 'var(--hc-bg)', padding: '0.6rem 0.75rem', borderRadius: '6px' }}>
              <i className="bi bi-info-circle" style={{ marginRight: '0.35rem' }} />
              After creating, you'll be taken to the builder to add components.
            </div>
          )}
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Bicycle"
          message={`Are you sure you want to delete "${confirmDelete.name}"? This cannot be undone.`}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  );
}
