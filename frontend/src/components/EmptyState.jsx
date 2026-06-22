export function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div className="hc-empty">
      <div className="hc-empty-icon">{icon}</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
