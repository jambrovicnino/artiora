# ETERNA Design v2 — Polish & Interactivity

**Date:** 2026-03-05
**Status:** Approved

## Overview

Enhance ETERNA's visual experience with subtle luxury interactions while preserving the existing dark+gold aesthetic. Five interconnected improvements that elevate the brand feel from "good website" to "premium art service."

## 1. Gallery Page Centering Fix

**Problem:** "Družinski Portret — Pred in Po" content is slightly off-center on the gallery page.

**Fix:**
- Ensure gallery page container has `text-align: center` and `margin: 0 auto`
- Verify max-width constraints and padding symmetry
- Check BeforeAfterSlider centering within its parent

## 2. Custom Cursor System — Subtle & Elegant

**Approach:** CSS custom cursor with JS-powered trail effect.

**Cursor variants:**
- **Default (everywhere):** 8px gold circle, replaces system cursor
- **On images:** Brush icon SVG cursor — signals "restoration happens here"
- **On buttons/links:** Gold circle enlarges to 12px — subtle hover feedback
- **Trail:** 3-4 ghost dots that follow cursor with 100ms stagger, fade out quickly (opacity 0.3 → 0)

**Implementation:**
- Custom `<CursorEffect />` component mounted at App level
- Uses `mousemove` event listener on document
- CSS classes on elements determine cursor variant: `data-cursor="brush"`, `data-cursor="pointer"`
- Trail rendered as absolutely positioned divs in a fixed container
- Disable on touch devices (no cursor on mobile)

## 3. Hero Background Enhancement

**Problem:** Hero background is flat black (#0a0a0a) — feels empty.

**Enhancements:**
- **Radial gradient:** Subtle gold glow from center, ~3% opacity `radial-gradient(ellipse at 50% 40%, rgba(201,168,76,0.03) 0%, transparent 70%)`
- **Noise texture:** CSS pseudo-element with SVG noise filter for grain — adds richness without images
- **Floating particles:** 5-8 small gold dots (2-3px) that drift upward slowly — like gold dust. Pure CSS animation with different speeds/delays per particle.

**No JavaScript needed** — all achievable with CSS animations and pseudo-elements.

## 4. Logo 3D Elegant Effect

**Current:** Flat 2D diamond (rotated square) with "E" inside.

**Enhancement:**
- **Double frame:** Add inner square border inside diamond for depth illusion
- **3D perspective on hover:** `perspective(800px) rotateY(5deg) rotateX(-3deg)` with smooth transition
- **Gold glow:** Multi-layered box-shadow creating luminous edge effect
- **Subtle idle animation:** Very slow breathing glow (pulse shadow opacity 0.15 → 0.25 over 4s)

**CSS-only implementation** — transforms + box-shadow + keyframe animation.

## 5. User-Touchy Micro-interactions

**Gallery image hover:**
- Scale 1.02 + subtle gold glow border
- Cursor changes to brush variant
- Smooth 0.4s cubic-bezier transition

**Scroll parallax:**
- Hero title moves at 0.85x scroll speed (subtle parallax)
- Upload box moves at 0.95x (barely noticeable depth)
- Implemented via CSS `transform: translateY()` on scroll

**Button click ripple:**
- Gold wave expands from click point
- Fades out over 600ms
- Pure CSS using `::after` pseudo-element with animation

## Technical Constraints

- **No new npm dependencies** — all CSS/vanilla JS
- **Performance:** requestAnimationFrame for cursor, CSS animations for everything else
- **Mobile:** Cursor effects disabled, particles simplified, parallax removed
- **Accessibility:** Custom cursor is cosmetic only, doesn't affect functionality

## Files to Modify

1. `src/App.css` — Global cursor hide, noise texture, particle keyframes
2. `src/components/CursorEffect.jsx` + `.css` — NEW: Custom cursor component
3. `src/components/home/Hero.jsx` + `.css` — Background gradient, particles, parallax
4. `src/components/layout/Navbar.jsx` + `.css` — Logo 3D effect
5. `src/pages/GalleryPage.jsx` + `.css` — Centering fix
6. `src/components/home/GallerySection.jsx` + `.css` — Hover interactions
7. `src/App.jsx` — Mount CursorEffect component
