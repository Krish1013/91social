import { Modal } from './Modal';

export function ConfirmDialog({ title, message, onConfirm, onCancel, danger = true }) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button className="hc-btn hc-btn-outline" onClick={onCancel}>Cancel</button>
          <button className={`hc-btn ${danger ? 'hc-btn-danger' : 'hc-btn-primary'}`} onClick={onConfirm}>
            Confirm
          </button>
        </>
      }
    >
      <p style={{ margin: 0, color: '#475569' }}>{message}</p>
    </Modal>
  );
}
