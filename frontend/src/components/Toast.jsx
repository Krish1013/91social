export function Toast({ toasts }) {
  if (!toasts.length) return null;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  return (
    <div className="hc-toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`hc-toast ${t.type}`}>
          <span style={{ fontSize: '1rem', fontWeight: 700 }}>{icons[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
