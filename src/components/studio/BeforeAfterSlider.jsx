import { useState } from 'react';
import './BeforeAfterSlider.css';

export default function BeforeAfterSlider({ originalImage, processedImage }) {
  const [position, setPosition] = useState(50);

  const handleChange = (e) => {
    setPosition(Number(e.target.value));
  };

  if (!originalImage) return null;

  const afterSrc = processedImage || originalImage;

  return (
    <div className="ba-slider">
      {/* Labels */}
      <div className="ba-labels">
        <span className="ba-label ba-label-left">ORIGINAL</span>
        <span className="ba-label ba-label-center">
          <span className="ba-dot">●</span> ORIGINAL
        </span>
        <span className="ba-label ba-label-right">OBNOVLJENO</span>
      </div>

      {/* Comparison container */}
      <div className="ba-container">
        {/* Before (original) — full width underneath */}
        <img
          src={originalImage}
          alt="Original"
          className="ba-image ba-before"
        />

        {/* After (processed) — clipped */}
        <div
          className="ba-after-wrap"
          style={{ clipPath: `inset(0 0 0 ${position}%)` }}
        >
          <img
            src={afterSrc}
            alt="Obnovljeno"
            className="ba-image"
          />
        </div>

        {/* Slider input */}
        <input
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={handleChange}
          className="ba-range"
        />

        {/* Visual divider line + handle */}
        <div
          className="ba-divider"
          style={{ left: `${position}%` }}
        >
          <div className="ba-handle">
            <span>‹›</span>
          </div>
        </div>
      </div>
    </div>
  );
}
