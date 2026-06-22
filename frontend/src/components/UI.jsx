import React from 'react';

// ─── Toast Notifications ──────────────────────────────────────────────────────
export function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div
      className="position-fixed top-0 end-0 p-3"
      style={{ zIndex: 1100 }}
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast show mb-2 border-0 shadow-sm`}
          role="alert"
        >
          <div
            className={`toast-body d-flex align-items-center gap-2 rounded
              ${toast.type === 'success' ? 'bg-success text-white' : ''}
              ${toast.type === 'error' ? 'bg-danger text-white' : ''}
              ${toast.type === 'info' ? 'bg-primary text-white' : ''}
            `}
          >
            <i className={`bi ${
              toast.type === 'success' ? 'bi-check-circle-fill' :
              toast.type === 'error'   ? 'bi-x-circle-fill' :
              'bi-info-circle-fill'
            }`} />
            <span className="flex-grow-1">{toast.message}</span>
            <button
              className="btn-close btn-close-white btn-sm"
              onClick={() => onRemove(toast.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted mb-0">{message}</p>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon = 'bi-inbox', title, message, action }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
      <i className={`bi ${icon} text-muted mb-3`} style={{ fontSize: '3rem' }} />
      <h5 className="text-muted mb-1">{title}</h5>
      <p className="text-muted mb-3" style={{ maxWidth: 340 }}>{message}</p>
      {action}
    </div>
  );
}

// ─── Page Header ─────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="d-flex align-items-start justify-content-between mb-4">
      <div>
        <h2 className="fw-bold mb-1">{title}</h2>
        {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, color = 'primary', onClick }) {
  return (
    <div
      className={`card border-0 shadow-sm h-100 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="card-body d-flex align-items-center gap-3 p-4">
        <div
          className={`d-flex align-items-center justify-content-center rounded-3 bg-${color} bg-opacity-10`}
          style={{ width: 52, height: 52, flexShrink: 0 }}
        >
          <i className={`bi ${icon} text-${color} fs-4`} />
        </div>
        <div>
          <div className="text-muted small">{label}</div>
          <div className="fw-bold fs-3 lh-1">{value}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
export function ConfirmDialog({ show, title, message, onConfirm, onCancel, danger = true }) {
  if (!show) return null;
  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} />
      <div className="modal fade show d-block" style={{ zIndex: 1050 }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold">{title}</h5>
              <button className="btn-close" onClick={onCancel} />
            </div>
            <div className="modal-body">
              <p className="text-muted mb-0">{message}</p>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button className="btn btn-light" onClick={onCancel}>Cancel</button>
              <button
                className={`btn btn-${danger ? 'danger' : 'primary'}`}
                onClick={onConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Badge for category ───────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  'Frame':     'primary',
  'Tyre':      'success',
  'Gear Set':  'info',
  'Brake':     'warning',
  'Seat':      'secondary',
  'Chain':     'dark',
  'Handlebar': 'danger',
  'Pedal':     'primary',
  'Rim':       'success',
  'Light':     'warning',
  'Other':     'secondary',
};

export function CategoryBadge({ category }) {
  const color = CATEGORY_COLORS[category] || 'secondary';
  return (
    <span className={`badge bg-${color} bg-opacity-10 text-${color} fw-medium px-2 py-1`}>
      {category}
    </span>
  );
}

// ─── Error Alert ──────────────────────────────────────────────────────────────
export function ErrorAlert({ message, onRetry }) {
  return (
    <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
      <i className="bi bi-exclamation-triangle-fill" />
      <span className="flex-grow-1">{message}</span>
      {onRetry && (
        <button className="btn btn-sm btn-outline-danger ms-auto" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
