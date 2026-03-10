import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const DEMO_ACCOUNTS = [
  { label: 'Nino (Umetnik)', email: 'psn.nino4@gmail.com', password: 'demo123' },
  { label: 'Nino J. (Kupec)', email: 'jambrovic.nino@gmail.com', password: 'demo123' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleDemoAccount(account) {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Small delay to simulate network request
    setTimeout(() => {
      const result = login(email, password);

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error);
      }
      setLoading(false);
    }, 400);
  }

  return (
    <div className="login-page">
      <div className="login-card corner-brackets">
        {/* Header */}
        <div className="login-header">
          <div className="gold-divider" />
          <h1 className="login-title">PRIJAVA</h1>
          <p className="login-subtitle">
            Vstopite v svet umetnosti
          </p>
        </div>

        {/* Demo accounts */}
        <div className="demo-accounts">
          <span className="demo-label">Hitri demo racuni:</span>
          <div className="demo-buttons">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                className="demo-btn"
                onClick={() => handleDemoAccount(account)}
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="login-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </div>
        )}

        {/* Login form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              E-NASLOV
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="vas@email.si"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              GESLO
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Vnesite geslo"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-gold login-submit"
            disabled={loading}
          >
            {loading ? 'PRIJAVLJAM...' : 'PRIJAVA'}
          </button>
        </form>

        {/* Footer link */}
        <div className="login-footer">
          <span className="login-footer-text">Nimate racuna?</span>
          <Link to="/registracija" className="login-footer-link">
            Registrirajte se
          </Link>
        </div>
      </div>
    </div>
  );
}
