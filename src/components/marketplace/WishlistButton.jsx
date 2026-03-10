import { useState } from 'react';
import { useWishlist } from '../../context/WishlistContext';

const baseStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  background: 'rgba(10, 10, 10, 0.7)',
  border: '1px solid rgba(201, 168, 76, 0.2)',
  borderRadius: '50%',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backdropFilter: 'blur(8px)',
  padding: 0,
};

const heartFilledPath =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 ' +
  '2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 ' +
  '19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

const heartOutlinePath =
  'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 ' +
  '4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 ' +
  '22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 ' +
  '4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 ' +
  '0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z';

export default function WishlistButton({ artworkId }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [animating, setAnimating] = useState(false);
  const active = isWishlisted(artworkId);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAnimating(true);
    toggleWishlist(artworkId);
    setTimeout(() => setAnimating(false), 400);
  };

  const scale = animating ? 'scale(1.3)' : 'scale(1)';

  return (
    <button
      onClick={handleClick}
      style={{
        ...baseStyle,
        borderColor: active ? 'rgba(201, 168, 76, 0.5)' : 'rgba(201, 168, 76, 0.2)',
      }}
      title={active ? 'Odstrani iz priljubljenih' : 'Dodaj med priljubljene'}
      aria-label={active ? 'Odstrani iz priljubljenih' : 'Dodaj med priljubljene'}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={active ? 'var(--gold)' : 'none'}
        stroke={active ? 'var(--gold)' : 'var(--text-secondary)'}
        strokeWidth="1.5"
        style={{
          transition: 'all 0.3s ease',
          transform: scale,
        }}
      >
        <path d={active ? heartFilledPath : heartOutlinePath} />
      </svg>
    </button>
  );
}
