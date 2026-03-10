import ArtworkCard from './ArtworkCard';
import './ArtworkGrid.css';

export default function ArtworkGrid({ artworks = [], columns = 3 }) {
  if (!artworks.length) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '4rem 1rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          letterSpacing: '0.05em',
        }}
      >
        Ni najdenih umetnin za izbrane filtre.
      </div>
    );
  }

  const gridStyle = {
    columnCount: columns,
  };

  return (
    <div className="artwork-grid" style={gridStyle}>
      {artworks.map((artwork) => (
        <div key={artwork.id} className="artwork-grid-item">
          <ArtworkCard artwork={artwork} />
        </div>
      ))}
    </div>
  );
}
