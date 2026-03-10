import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ARTIORA] ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'var(--font-body, sans-serif)',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-heading, serif)',
            fontSize: '2rem',
            fontWeight: 400,
            letterSpacing: '0.08em',
            marginBottom: '1rem',
            color: 'var(--text-primary, #fff)',
          }}>
            Nekaj je šlo narobe
          </h1>
          <p style={{
            color: 'var(--text-secondary, #999)',
            marginBottom: '2rem',
            maxWidth: '400px',
          }}>
            Prišlo je do nepričakovane napake. Prosimo, poskusite znova.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 32px',
              background: 'var(--gold, #b89c50)',
              color: '#000',
              border: 'none',
              fontFamily: 'var(--font-body, sans-serif)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            OSVEŽI STRAN
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
