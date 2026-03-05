import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div
      className="container"
      style={{
        textAlign: 'center',
        padding: '6rem 0',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}
    >
      <h1
        style={{
          fontSize: '4rem',
          color: 'var(--gold)',
          fontFamily: 'var(--font-heading)',
          fontWeight: 300,
        }}
      >
        404
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Stran ni najdena
      </p>
      <Link to="/" className="btn-gold">NA ZAČETEK</Link>
    </div>
  );
}
