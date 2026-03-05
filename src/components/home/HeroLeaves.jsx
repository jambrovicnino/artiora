import { useEffect, useRef, useState } from 'react';
import './HeroLeaves.css';

const LEAF_COUNT = 10;

/**
 * Floating gold leaves that orbit the hero section.
 * When a leaf enters the heading bounding box it fades out,
 * then reappears on the opposite side — as if passing through the text.
 * Disabled on touch devices and when prefers-reduced-motion is set.
 */
export default function HeroLeaves() {
  const containerRef = useRef(null);
  const leafElsRef = useRef([]);
  const leavesRef = useRef(null);
  const rafId = useRef(null);
  const headingRect = useRef(null);
  const heroRect = useRef(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Disable on touch devices
    const isTouchDevice =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) { setHidden(true); return; }

    // Respect reduced-motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) { setHidden(true); return; }

    // Find hero section and heading
    const heroEl = containerRef.current?.closest('.hero');
    const headingEl = heroEl?.querySelector('.hero-heading');
    if (!heroEl || !headingEl) return;

    // Initialize leaf states
    if (!leavesRef.current) {
      leavesRef.current = Array.from({ length: LEAF_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 28 + Math.random() * 14,
        baseRotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 0.4,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.06 - Math.random() * 0.10,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleAmplitude: 0.15 + Math.random() * 0.2,
        wobbleSpeed: 0.01 + Math.random() * 0.01,
        targetOpacity: 0.35 + Math.random() * 0.25,
        currentOpacity: 0,
        fading: false,
        fadingIn: true,
      }));
    }

    // Cache heading bounding rect in % coordinates relative to hero
    const updateRects = () => {
      const hRect = heroEl.getBoundingClientRect();
      const tRect = headingEl.getBoundingClientRect();
      heroRect.current = hRect;
      headingRect.current = {
        left: ((tRect.left - hRect.left) / hRect.width) * 100,
        right: ((tRect.right - hRect.left) / hRect.width) * 100,
        top: ((tRect.top - hRect.top) / hRect.height) * 100,
        bottom: ((tRect.bottom - hRect.top) / hRect.height) * 100,
      };
    };

    updateRects();
    window.addEventListener('resize', updateRects);

    // Animation loop
    const animate = () => {
      const leaves = leavesRef.current;
      if (!leaves) { rafId.current = requestAnimationFrame(animate); return; }

      for (let i = 0; i < leaves.length; i++) {
        const leaf = leaves[i];

        // Fade in on first appearance
        if (leaf.fadingIn && !leaf.fading) {
          leaf.currentOpacity = Math.min(
            leaf.currentOpacity + 0.004,
            leaf.targetOpacity,
          );
          if (leaf.currentOpacity >= leaf.targetOpacity) leaf.fadingIn = false;
        }

        // Wobble (sinusoidal sway)
        leaf.wobblePhase += leaf.wobbleSpeed;
        const wobble = Math.sin(leaf.wobblePhase) * leaf.wobbleAmplitude;

        // Update position
        leaf.x += leaf.vx + wobble;
        leaf.y += leaf.vy;
        leaf.baseRotation += leaf.rotationSpeed;

        // Edge wrapping
        if (leaf.y < -5) { leaf.y = 105; }
        if (leaf.y > 105) { leaf.y = -5; }
        if (leaf.x < -5) { leaf.x = 105; }
        if (leaf.x > 105) { leaf.x = -5; }

        // Heading collision detection
        const hr = headingRect.current;
        if (
          !leaf.fading &&
          hr &&
          leaf.x > hr.left &&
          leaf.x < hr.right &&
          leaf.y > hr.top &&
          leaf.y < hr.bottom
        ) {
          leaf.fading = true;
        }

        // Fade out when inside heading
        if (leaf.fading) {
          leaf.currentOpacity = Math.max(leaf.currentOpacity - 0.008, 0);

          // Fully faded — teleport to opposite side
          if (leaf.currentOpacity <= 0) {
            if (Math.abs(leaf.vx) > Math.abs(leaf.vy)) {
              leaf.x = leaf.vx > 0
                ? hr.right + 3 + Math.random() * 5
                : hr.left - 3 - Math.random() * 5;
            } else {
              leaf.y = leaf.vy < 0
                ? hr.top - 3 - Math.random() * 5
                : hr.bottom + 3 + Math.random() * 5;
            }
            leaf.fading = false;
            leaf.fadingIn = true;
            leaf.currentOpacity = 0;
          }
        }

        // Apply to DOM — no React re-render
        const el = leafElsRef.current[i];
        if (el && heroRect.current) {
          const px = (leaf.x / 100) * heroRect.current.width;
          const py = (leaf.y / 100) * heroRect.current.height;
          el.style.transform = `translate(${px}px, ${py}px) rotate(${leaf.baseRotation}deg)`;
          el.style.opacity = leaf.currentOpacity;
        }
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', updateRects);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  if (hidden) return null;

  const leaves = leavesRef.current || Array.from({ length: LEAF_COUNT }, (_, i) => ({
    id: i, size: 34,
  }));

  return (
    <div className="hero-leaves" ref={containerRef}>
      {leaves.map((leaf, i) => (
        <div
          key={leaf.id}
          className="hero-leaf"
          ref={(el) => (leafElsRef.current[i] = el)}
          style={{ opacity: 0 }}
        >
          <svg
            viewBox="0 0 24 40"
            width={leaf.size * 0.6}
            height={leaf.size}
            className="hero-leaf-svg"
          >
            {/* Leaf outline */}
            <path
              d="M12 0 C6 8, 0 16, 2 26 C4 34, 8 40, 12 40 C16 40, 20 34, 22 26 C24 16, 18 8, 12 0Z"
              fill="currentColor"
              opacity="0.9"
            />
            {/* Central vein */}
            <path
              d="M12 4 L12 36"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.6"
              fill="none"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
