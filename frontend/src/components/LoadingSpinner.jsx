export function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="hc-loading">
      <div className="spinner-border spinner-border-sm text-secondary" role="status" />
      <span>{message}</span>
    </div>
  );
}
