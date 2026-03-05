# History Upscaled

**Breathe New Life into Yesterday - Where History Meets High Definition**

A vintage-themed premium photo restoration service web application featuring a beautiful parchment aesthetic and elegant ornate frames. Built with React and Vite.

## ✨ Features

### Restoration Services
- **The Timeless Grain**: Classic B&W upscaling with 4K detail and scratch removal
- **The Breath of Life**: Period-accurate colorization with vibrant, authentic tones
- **The AI Artisan**: Custom AI edits with modern shifts or portrait vibes

### User Experience
- Interactive before/after image slider on homepage
- Ornate vintage-framed service cards
- Shopping cart functionality
- PayPal checkout integration
- Fully responsive vintage design
- Elegant parchment background throughout

## 🎨 Design Theme

The application features a comprehensive vintage aesthetic:
- Warm parchment color palette (#d4af7a, #c19a6b, #8b7355)
- Classic serif typography (Georgia, Palatino)
- Ornate decorative frames for service showcases
- Vintage pattern overlays and textures
- Interactive image comparison slider

## 🛠 Tech Stack

- **Frontend Framework**: React 19.2
- **Build Tool**: Vite 7.3
- **Routing**: React Router DOM 7.13
- **Payment**: PayPal React SDK
- **Styling**: Custom CSS with vintage theme
- **AI Integration**: Google Generative AI (Gemini)

## 📦 Installation

```bash
npm install
```

## 🚀 Development

```bash
npm run dev
```

Visit `http://localhost:5173` to view the application.

## 🏗 Build

```bash
npm run build
```

## 👀 Preview Production Build

```bash
npm run preview
```

## 🧹 Linting

```bash
npm run lint
```

## 📁 Project Structure

```
src/
├── components/
│   ├── cart/          # Shopping cart components
│   ├── checkout/      # Checkout and payment components
│   ├── common/        # Shared components
│   ├── home/          # Home page components (Hero, Services, HowItWorks)
│   ├── layout/        # Layout components (Navbar, Footer)
│   └── service/       # Service-related components
├── context/           # React context providers (CartContext)
├── data/             # Static data and service configuration
├── pages/            # Page components
└── services/         # API services (Gemini integration)

public/
└── demo/             # Demo images for homepage showcase
```

## 🖼️ Adding Demo Images

To display the homepage properly, add the following images to `public/demo/`:

1. **family-bw.jpg** - Black and white family photo (16:10 aspect ratio)
2. **family-color.jpg** - Colorized version of family photo
3. **grandparents-bw.jpg** - Portrait for "Timeless Grain" card (4:5 aspect ratio)
4. **portrait-color.jpg** - Portrait for "Breath of Life" card
5. **couple-vintage.jpg** - Portrait for "AI Artisan" card

See `public/demo/README.md` for detailed image specifications.

## 🎯 Key Components

### Hero Section
- Interactive before/after slider
- Vintage HeirloomAI branding
- Tagline: "Breathe New Life into Yesterday"

### Services Section
- Three ornate-framed service cards
- Each card features vintage styling with decorative corners
- Showcases different restoration options

### How It Works
- Simple 3-step process visualization
- Circular icon badges
- Clear call-to-action button

## 🎨 Color Palette

```css
--vintage-tan: #d4af7a
--vintage-brown: #c19a6b
--frame-brown: #8b7355
--dark-brown: #3d2817
--darker-brown: #2d1f13
--parchment: #f5f5dc
```

## 📝 License

This project is private and proprietary.

---

Made with ❤️ for preserving precious memories
