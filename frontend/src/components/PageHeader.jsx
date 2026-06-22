export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="hc-page-header">
      <div>
        <h1 className="hc-page-title">{title}</h1>
        {subtitle && <p className="hc-page-subtitle">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
