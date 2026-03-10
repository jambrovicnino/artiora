import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  }

  function handleRoleSelect(role) {
    setFormData((prev) => ({ ...prev, role }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Prosimo, vnesite ime in priimek.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Prosimo, vnesite e-naslov.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Geslo mora imeti vsaj 6 znakov.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Gesli se ne ujemata.');
      return;
    }

    setLoading(true);

    // Simulate registration (demo only)
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/prijava');
      }, 2000);
    }, 600);
  }

  // ── Success state ──
  if (success) {
    return (
      <div className="register-page">
        <div className="register-card corner-brackets">
          <div className="register-success">
            <div className="register-success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="register-success-title">Registracija uspesna!</h2>
            <p className="register-success-text">
              Preusmerjam vas na prijavo...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Registration form ──
  return (
    <div className="register-page">
      <div className="register-card corner-brackets">
        {/* Header */}
        <div className="register-header">
          <div className="gold-divider" />
          <h1 className="register-title">REGISTRACIJA</h1>
          <p className="register-subtitle">
            Pridružite se skupnosti umetnikov
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="register-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form className="register-form" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              IME IN PRIIMEK
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              placeholder="Vaše ime"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">
              E-NASLOV
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="vas@email.si"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="reg-password" className="form-label">
              GESLO
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Najmanj 6 znakov"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          {/* Confirm password */}
          <div className="form-group">
            <label htmlFor="reg-confirm" className="form-label">
              POTRDI GESLO
            </label>
            <input
              id="reg-confirm"
              name="confirmPassword"
              type="password"
              className="form-input"
              placeholder="Ponovite geslo"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          {/* Role selector */}
          <div className="form-group">
            <label className="form-label">VLOGA NA PLATFORMI</label>
            <div className="role-toggle">
              <button
                type="button"
                className={`role-btn${formData.role === 'artist' ? ' active' : ''}`}
                onClick={() => handleRoleSelect('artist')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l7-7 3 3-7 7-3-3z" />
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  <path d="M2 2l7.586 7.586" />
                  <circle cx="11" cy="11" r="2" />
                </svg>
                Umetnik
              </button>
              <button
                type="button"
                className={`role-btn${formData.role === 'customer' ? ' active' : ''}`}
                onClick={() => handleRoleSelect('customer')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Kupec
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-gold register-submit"
            disabled={loading}
          >
            {loading ? 'REGISTRIRAM...' : 'USTVARI RACUN'}
          </button>
        </form>

        {/* Footer link */}
        <div className="register-footer">
          <span className="register-footer-text">Že imate racun?</span>
          <Link to="/prijava" className="register-footer-link">
            Prijavite se
          </Link>
        </div>
      </div>
    </div>
  );
}
