import { NavLink } from 'react-router-dom';

export function Navbar() {
  return (
    <nav className="hc-navbar">
      <NavLink to="/" className="hc-navbar-brand">
        <span className="logo-icon">🚲</span>
        Hero <span className="accent">Cycles</span>
      </NavLink>
      <div className="hc-nav-links">
        <NavLink to="/"           end className={({isActive}) => `hc-nav-link${isActive ? ' active' : ''}`}>
          <i className="bi bi-speedometer2" /> Dashboard
        </NavLink>
        <NavLink to="/components"    className={({isActive}) => `hc-nav-link${isActive ? ' active' : ''}`}>
          <i className="bi bi-puzzle" /> Components
        </NavLink>
        <NavLink to="/bicycles"      className={({isActive}) => `hc-nav-link${isActive ? ' active' : ''}`}>
          <i className="bi bi-bicycle" /> Bicycles
        </NavLink>
      </div>
    </nav>
  );
}
