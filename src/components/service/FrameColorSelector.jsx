import { frameColors } from '../../data/frameOptions';
import './FrameColorSelector.css';

export default function FrameColorSelector({ selectedColor, onSelect }) {
  return (
    <div className="frame-color-selector">
      <h3>Select Frame Color</h3>
      <div className="color-options">
        {frameColors.map((c) => (
          <button
            key={c.id}
            className={`color-swatch ${selectedColor === c.id ? 'selected' : ''}`}
            onClick={() => onSelect(c.id)}
            title={c.label}
          >
            <span className="swatch" style={{ background: c.hex }} />
            <span className="color-label">{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
