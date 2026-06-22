import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/',           icon: '⊞',  label: 'Dashboard' },
  { to: '/components', icon: '⚙',  label: 'Components' },
  { to: '/prices',     icon: '₹',  label: 'Price History' },
  { to: '/bicycles',   icon: '🚲', label: 'Bicycles' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-mark">🚲 Hero</span>
        <span className="logo-sub">Pricing Engine</span>
      </div>
      <p className="nav-section-label">Navigation</p>
      {navItems.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">{icon}</span>
          {label}
        </NavLink>
      ))}
    </aside>
  );
}
