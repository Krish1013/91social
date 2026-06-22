import { useEffect } from 'react';

export function Modal({ title, onClose, children, footer }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="hc-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="hc-modal">
        <div className="hc-modal-header">
          <h2 className="hc-modal-title">{title}</h2>
          <button onClick={onClose} className="hc-btn hc-btn-outline hc-btn-sm" style={{ padding: '0.2rem 0.5rem' }}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="hc-modal-body">{children}</div>
        {footer && <div className="hc-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
