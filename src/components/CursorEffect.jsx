import { useEffect, useRef, useState } from 'react';
import './CursorEffect.css';

/**
 * Custom cursor — subtle gold dot with trail.
 * Variants: default (8px dot), brush (on images), pointer (on buttons).
 * Disabled on touch devices.
 */
export default function CursorEffect() {
  const dotRef = useRef(null);
  const trailRefs = useRef([]);
  const pos = useRef({ x: -100, y: -100 });
  const trail = useRef([]);
  const rafId = useRef(null);
  const [variant, setVariant] = useState('default');
  const [visible, setVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Detect touch device — disable custom cursor
    const isTouchDevice =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      setIsTouch(true);
      return;
    }

    // Initialize trail positions
    trail.current = Array(4).fill({ x: -100, y: -100 });

    const handleMouseMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };

      if (!visible) setVisible(true);

      // Detect cursor variant from hovered element
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) return;

      // Check for data-cursor attribute up the DOM tree
      const cursorEl = el.closest('[data-cursor]');
      if (cursorEl) {
        setVariant(cursorEl.dataset.cursor);
        return;
      }

      // Auto-detect interactive elements
      const tag = el.tagName.toLowerCase();
      const isInteractive =
        tag === 'button' ||
        tag === 'a' ||
        el.closest('button') ||
        el.closest('a') ||
        el.role === 'button';

      setVariant(isInteractive ? 'pointer' : 'default');
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Animation loop — smooth cursor + trail
    const animate = () => {
      // Update dot position immediately
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      }

      // Update trail with staggered lerp
      const newTrail = [...trail.current];
      for (let i = 0; i < newTrail.length; i++) {
        const target = i === 0 ? pos.current : newTrail[i - 1];
        const speed = 0.15 - i * 0.02; // Slower for further dots
        newTrail[i] = {
          x: newTrail[i].x + (target.x - newTrail[i].x) * speed,
          y: newTrail[i].y + (target.y - newTrail[i].y) * speed,
        };

        if (trailRefs.current[i]) {
          trailRefs.current[i].style.transform = `translate(${newTrail[i].x}px, ${newTrail[i].y}px)`;
        }
      }
      trail.current = newTrail;

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [visible]);

  if (isTouch) return null;

  return (
    <div className={`cursor-container ${visible ? 'visible' : ''}`}>
      {/* Trail dots */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="cursor-trail"
          ref={(el) => (trailRefs.current[i] = el)}
          style={{ opacity: 0.25 - i * 0.05 }}
        />
      ))}
      {/* Main cursor dot */}
      <div
        ref={dotRef}
        className={`cursor-dot cursor-${variant}`}
      />
    </div>
  );
}
