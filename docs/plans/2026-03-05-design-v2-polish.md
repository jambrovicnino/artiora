# ETERNA Design v2 Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Elevate ETERNA from good website to premium art service with subtle luxury interactions — custom cursor, hero background, logo 3D effect, micro-interactions.

**Architecture:** Pure CSS + vanilla JS approach. No new dependencies. CursorEffect as a global React component. All animations CSS-based except cursor tracking (requestAnimationFrame). Mobile: cursor disabled, particles simplified.

**Tech Stack:** React + Vite, CSS custom properties, SVG cursors, CSS animations

---

### Task 1: Gallery Page Centering Fix

**Files:**
- Modify: `src/pages/GalleryPage.jsx`
- Modify: `src/pages/GalleryPage.css` (if exists, or inline styles)

**Step 1: Verify and fix centering**

Check `.gallery-page` container and `.gallery-showcase` sections. Ensure all text blocks and slider components are centered with `margin: 0 auto` and `text-align: center`.

**Step 2: Visual verify**

Preview at `/galerija`, confirm "Družinski Portret" heading and slider are centered.

**Step 3: Commit**

```bash
git add src/pages/GalleryPage.*
git commit -m "fix: Center gallery page content"
```

---

### Task 2: Hero Background Enhancement

**Files:**
- Modify: `src/components/home/Hero.css`

**Step 1: Add radial gold gradient**

On `.hero` — add `background` with subtle radial gradient:
```css
background:
  radial-gradient(ellipse at 50% 30%, rgba(201,168,76,0.03) 0%, transparent 60%),
  var(--bg-primary);
```

**Step 2: Add CSS noise texture via pseudo-element**

On `.hero::before`:
```css
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,..."); /* inline SVG noise */
  pointer-events: none;
  z-index: 0;
}
```

**Step 3: Add floating gold particles**

CSS-only approach with `@keyframes float-up` and 5-8 small pseudo-elements or a `.hero-particles` container with spans:
- 2-3px gold dots
- Drift upward at different speeds (15s-25s)
- Different horizontal positions
- Loop infinitely

**Step 4: Visual verify**

Preview at `/` — hero should have subtle warmth, grain texture, and floating gold dust.

**Step 5: Commit**

```bash
git add src/components/home/Hero.*
git commit -m "feat: Hero background with gold gradient, noise, floating particles"
```

---

### Task 3: Logo 3D Elegant Effect

**Files:**
- Modify: `src/components/layout/Navbar.jsx` (lines 17-19)
- Modify: `src/components/layout/Navbar.css` (lines 26-44)

**Step 1: Add inner square frame to diamond**

In Navbar.jsx, update the diamond markup:
```jsx
<span className="logo-diamond">
  <span className="diamond-frame" />
  <span className="diamond-inner">E</span>
</span>
```

**Step 2: Add 3D CSS styles**

In Navbar.css:
```css
.logo-diamond {
  /* existing + add: */
  perspective: 800px;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.logo-diamond:hover {
  transform: rotate(45deg) rotateY(8deg) rotateX(-5deg);
}

.diamond-frame {
  position: absolute;
  inset: 4px;
  border: 1px solid rgba(201,168,76,0.4);
}

/* Breathing glow animation */
@keyframes logo-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(201,168,76,0.15); }
  50% { box-shadow: 0 0 16px rgba(201,168,76,0.25); }
}
```

**Step 3: Visual verify**

Preview — logo diamond should have inner frame, subtle glow pulse, and 3D rotation on hover.

**Step 4: Commit**

```bash
git add src/components/layout/Navbar.*
git commit -m "feat: Logo 3D effect with inner frame and hover perspective"
```

---

### Task 4: Custom Cursor Component

**Files:**
- Create: `src/components/CursorEffect.jsx`
- Create: `src/components/CursorEffect.css`
- Modify: `src/App.jsx` (mount component at line 20)
- Modify: `src/App.css` (hide default cursor globally)

**Step 1: Create CursorEffect component**

`CursorEffect.jsx`:
- State: `{ x, y, variant }` (default / brush / pointer)
- `useEffect` with `mousemove` listener → update position via `requestAnimationFrame`
- `useEffect` detecting hovered element's `data-cursor` attribute
- Trail: array of 4 positions with staggered delay
- Render: fixed-position container with cursor dot + trail dots
- Media query check: disable on touch devices

**Step 2: Create CursorEffect.css**

```css
.cursor-dot { /* 8px gold circle */ }
.cursor-dot.brush { /* brush SVG background, 24px */ }
.cursor-dot.pointer { /* 12px gold circle */ }
.cursor-trail { /* 4px gold circles, decreasing opacity */ }
```

**Step 3: Hide default cursor globally**

In `App.css`:
```css
@media (hover: hover) and (pointer: fine) {
  *, *::before, *::after { cursor: none !important; }
}
```

**Step 4: Mount in App.jsx**

Add `<CursorEffect />` before `<ScrollToTop />`.

**Step 5: Add data-cursor attributes**

- `data-cursor="brush"` on image elements in Hero, Gallery
- `data-cursor="pointer"` on buttons and links (auto-detect via tag name)

**Step 6: Visual verify**

Preview — gold dot follows mouse, brush on images, enlarged on buttons, trail follows.

**Step 7: Commit**

```bash
git add src/components/CursorEffect.* src/App.jsx src/App.css
git commit -m "feat: Custom cursor with gold dot, brush on images, trail effect"
```

---

### Task 5: Micro-interactions — Hover, Parallax, Ripple

**Files:**
- Modify: `src/components/home/GallerySection.css` (hover glow)
- Modify: `src/components/home/Hero.css` (parallax)
- Modify: `src/App.css` (button ripple)

**Step 1: Gallery image hover glow**

Enhance `.collage-image-wrap:hover`:
```css
box-shadow: 0 0 30px rgba(201,168,76,0.08);
```
Add `data-cursor="brush"` to gallery images.

**Step 2: Hero parallax**

Add scroll-based parallax to `.hero-content`:
```css
.hero-content {
  transform: translateY(calc(var(--scroll-y, 0) * -0.15));
  will-change: transform;
}
```
Small JS in Hero.jsx to set `--scroll-y` CSS variable on scroll.

**Step 3: Button ripple effect**

On `.btn-gold`:
```css
.btn-gold { position: relative; overflow: hidden; }
.btn-gold::after {
  content: '';
  position: absolute;
  background: rgba(255,255,255,0.3);
  border-radius: 50%;
  transform: scale(0);
  animation: none;
}
.btn-gold:active::after {
  animation: ripple 0.6s ease-out;
}
@keyframes ripple {
  to { transform: scale(4); opacity: 0; }
}
```

**Step 4: Visual verify all interactions**

Check hover glow, parallax scroll, button ripple.

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: Micro-interactions — gallery glow, parallax, button ripple"
```

---

### Task 6: Deploy

**Step 1: Build check**

```bash
npm run build
```

**Step 2: Deploy to Vercel**

```bash
npx vercel --prod
```

**Step 3: Verify production**

Check https://eterna-kohl.vercel.app with all 5 features working.
