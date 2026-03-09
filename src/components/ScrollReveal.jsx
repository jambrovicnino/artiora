import { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal — wraps children and animates them into view
 * when they enter the viewport via IntersectionObserver.
 *
 * Props:
 *   variant: 'fade-up' | 'fade-in' | 'fade-left' | 'fade-right' (default: 'fade-up')
 *   delay:    ms delay before animation starts (default: 0)
 *   stagger:  if true, applies stagger-delay to direct children via CSS variable
 *   threshold: 0–1 how much of element must be visible (default: 0.12)
 *   className: extra classes
 */
export default function ScrollReveal({
  children,
  variant = 'fade-up',
  delay = 0,
  stagger = false,
  threshold = 0.12,
  className = '',
}) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion — reveal immediately
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`sr sr-${variant} ${revealed ? 'sr-visible' : ''} ${stagger ? 'sr-stagger' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
