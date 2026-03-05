import { frameSizes } from '../../data/frameOptions';
import './FrameSizeSelector.css';

export default function FrameSizeSelector({ basePrice, selectedSize, onSelect }) {
  return (
    <div className="frame-size-selector">
      <h3>Select Frame Size</h3>
      <div className="size-options">
        {frameSizes.map((size) => {
          const price = Math.round(basePrice * size.multiplier);
          return (
            <button
              key={size.id}
              className={`size-card ${selectedSize === size.id ? 'selected' : ''}`}
              onClick={() => onSelect(size.id)}
            >
              <span className="size-label">{size.label}</span>
              <span className="size-price">${price}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
