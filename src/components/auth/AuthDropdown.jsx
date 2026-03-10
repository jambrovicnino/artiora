import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthDropdown.css';

export default function AuthDropdown() {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change (Escape key)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Get user initials for avatar fallback
  function getInitials(name) {
    if (!name) return '?';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function handleLogout() {
    setOpen(false);
    logout();
  }

  // ── Logged out state ──
  if (!isAuthenticated) {
    return (
      <div className="auth-dropdown" ref={dropdownRef}>
        <div className="auth-buttons-inline">
          <Link to="/prijava" className="auth-btn-login">
            Prijava
          </Link>
          <Link to="/registracija" className="auth-btn-register">
            Registracija
          </Link>
        </div>
      </div>
    );
  }

  // ── Logged in state ──
  return (
    <div className="auth-dropdown" ref={dropdownRef}>
      <button
        className="auth-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="auth-avatar-img"
          />
        ) : (
          <span className="auth-avatar-initials">
            {getInitials(user.name)}
          </span>
        )}
        <span className="auth-trigger-name">{user.name}</span>
        <svg
          className={`auth-chevron${open ? ' open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 4.5L6 7.5L9 4.5" />
        </svg>
      </button>

      {open && (
        <div className="auth-dropdown-card corner-brackets">
          {/* User info header */}
          <div className="auth-dropdown-header">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="auth-dropdown-avatar-img"
              />
            ) : (
              <span className="auth-dropdown-avatar-initials">
                {getInitials(user.name)}
              </span>
            )}
            <div className="auth-dropdown-info">
              <span className="auth-dropdown-name">{user.name}</span>
              <span className="auth-dropdown-role">
                {user.role === 'admin'
                  ? 'Administrator'
                  : user.role === 'artist'
                  ? 'Umetnik'
                  : 'Kupec'}
              </span>
            </div>
          </div>

          <div className="auth-dropdown-divider" />

          {/* Navigation links */}
          <nav className="auth-dropdown-nav">
            <Link
              to="/nadzorna-plosca"
              className="auth-dropdown-link"
              onClick={() => setOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              Nadzorna Plosca
            </Link>

            <Link
              to="/nadzorna-plosca/umetnine"
              className="auth-dropdown-link"
              onClick={() => setOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              Moje Umetnine
            </Link>

            <Link
              to="/priljubljene"
              className="auth-dropdown-link"
              onClick={() => setOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              Priljubljene
            </Link>

            {user.role === 'admin' && (
              <Link
                to="/admin/pregled"
                className="auth-dropdown-link auth-dropdown-link--admin"
                onClick={() => setOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Admin Pregled
              </Link>
            )}
          </nav>

          <div className="auth-dropdown-divider" />

          {/* Logout */}
          <button className="auth-dropdown-logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Odjava
          </button>
        </div>
      )}
    </div>
  );
}
