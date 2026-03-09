import { useMemo } from 'react';
import './HeroLeaves.css';

/**
 * Gemstone shapes for clip-path.
 * diamond, hexagon, teardrop, round-cut, emerald-cut
 */
const GEM_SHAPES = [
  'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',                         // diamond
  'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',      // hexagon
  'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', // star
  'ellipse(50% 50%)',                                                      // round
  'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)',                          // trapezoid / emerald
];

const GEM_COLORS = [
  '#8b5cf6',  // amethyst
  '#3b82f6',  // sapphire
  '#ec4899',  // ruby / pink
  '#10b981',  // emerald
  '#f97316',  // amber / orange
  '#d946ef',  // magenta
  '#06b6d4',  // aquamarine
  '#eab308',  // topaz / gold
];

const GEM_COUNT = 18;

/**
 * Aurora Background + Floating Gemstones.
 * Gemstones drift slowly like the leaves in ETERNA Spomini,
 * but with vivid gem shapes and colors.
 */
export default function HeroLeaves() {
  const gems = useMemo(() => {
    return Array.from({ length: GEM_COUNT }, (_, i) => {
      const shape = GEM_SHAPES[i % GEM_SHAPES.length];
      const color = GEM_COLORS[i % GEM_COLORS.length];
      const size = 8 + Math.random() * 18;           // 8–26px
      const left = Math.random() * 100;               // 0–100%
      const delay = Math.random() * 20;               // 0–20s stagger
      const duration = 15 + Math.random() * 20;       // 15–35s fall
      const drift = -60 + Math.random() * 120;        // horizontal drift px
      const rotation = Math.random() * 360;            // start rotation
      const shimmerDuration = 3 + Math.random() * 4;  // 3–7s shimmer cycle

      return {
        key: i,
        shape,
        color,
        size,
        style: {
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}%`,
          clipPath: shape,
          background: `linear-gradient(135deg, ${color}dd, ${color}88, ${color}cc)`,
          animationDuration: `${duration}s, ${shimmerDuration}s`,
          animationDelay: `${delay}s, ${delay * 0.7}s`,
          '--gem-drift': `${drift}px`,
          '--gem-rotate': `${rotation}deg`,
        },
      };
    });
  }, []);

  return (
    <div className="aurora-bg" aria-hidden="true">
      {/* Aurora gradient blobs */}
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      <div className="aurora-blob aurora-blob-4" />
      <div className="aurora-blob aurora-blob-5" />

      {/* Floating gemstones */}
      <div className="gems-container">
        {gems.map((gem) => (
          <div key={gem.key} className="gem" style={gem.style} />
        ))}
      </div>
    </div>
  );
}
