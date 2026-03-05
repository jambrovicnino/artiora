import { STYLE_METADATA } from '../../services/geminiService';
import './StyleSelector.css';

export default function StyleSelector({ selectedStyle, onSelect, disabled }) {
  return (
    <div className="style-selector">
      <h3>Select Enhancement Style</h3>
      <div className="style-options">
        {STYLE_METADATA.map((style) => (
          <button
            key={style.id}
            className={`style-card ${selectedStyle === style.id ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={() => !disabled && onSelect(style.id)}
            disabled={disabled}
            title={style.description}
          >
            <span className="style-icon">{style.icon}</span>
            <span className="style-label">{style.label}</span>
            <p className="style-description">{style.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
