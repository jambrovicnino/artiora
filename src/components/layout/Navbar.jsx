import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo-group" onClick={closeMenu}>
          <span className="logo-wrap">
            <span className="logo-glass-block" />
            <span className="logo-diamond">
              <span className="diamond-frame" />
              <span className="diamond-inner">E</span>
            </span>
          </span>
          <div className="logo-text">
            <span className="logo-brand">ARTIORA</span>
            <span className="logo-tagline">ARTISAN</span>
          </div>
        </Link>

        <div className={`nav-links${menuOpen ? ' open' : ''}`}>
          <NavLink
            to="/o-nas"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeMenu}
          >
            O NAS
          </NavLink>
          <NavLink
            to="/kako-deluje"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeMenu}
          >
            KAKO DELUJE
          </NavLink>
          <NavLink
            to="/galerija"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeMenu}
          >
            GALERIJA
          </NavLink>
          <NavLink
            to="/mnenja"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeMenu}
          >
            MNENJA
          </NavLink>
        </div>

        <div className="navbar-right">
          <Link to="/cart" className="cart-icon-link" aria-label="Košarica">
            <svg
              className="cart-icon-svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>

          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            onClick={toggleMenu}
            aria-label="Meni"
            aria-expanded={menuOpen}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </div>
    </nav>
  );
}
