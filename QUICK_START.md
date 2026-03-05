# Quick Start - Gemini AI Integration

## 🚀 Get Started in 3 Steps

### 1️⃣ Get API Key (5 minutes)
1. Go to https://aistudio.google.com/
2. Sign in with Google
3. Click "Get API Key" → "Create API Key"
4. Copy the key (starts with `AIza...`)

### 2️⃣ Configure Locally (2 minutes)
```bash
# Create environment file
echo "VITE_GEMINI_API_KEY=your_key_here" > .env.local

# Start development server
npx vercel dev
```

Visit http://localhost:3000 and test!

### 3️⃣ Deploy to Vercel (10 minutes)
```bash
# Push to GitHub
git add .
git commit -m "Add AI enhancement"
git push

# Deploy
1. Go to vercel.com
2. Import your GitHub repo
3. Add VITE_GEMINI_API_KEY in Settings → Environment Variables
4. Deploy!
```

---

## 📱 How It Works

### User Flow
1. **Upload Photo** → Drag & drop or browse
2. **Select Style** → Black & White / Colorized / Surprise Me
3. **Auto-Enhancement** → AI processes in 15-30 seconds
4. **View Results** → Toggle before/after comparison
5. **Add to Cart** → Enhanced photo saved

### Enhancement Styles
- **📸 Black & White**: Preserves monochrome, enhances clarity
- **🎨 Colorized**: Adds historical accurate colors
- **🎲 Surprise Me**: AI chooses best creative enhancement

---

## 📁 What Was Changed

### New Files (7)
```
api/
  └── gemini-upscale.js              # Serverless API function
src/
  ├── services/
  │   └── geminiService.js           # API client
  └── components/service/
      ├── StyleSelector.jsx          # Style selection UI
      └── StyleSelector.css          # Styles
.env.example                         # Template
vercel.json                          # Deployment config
GEMINI_SETUP.md                      # Full documentation
```

### Modified Files (5)
```
package.json                         # Added dependencies
.gitignore                           # Exclude .env files
src/components/service/
  ├── PhotoUploader.jsx              # +Processing overlay, comparison
  └── PhotoUploader.css              # +New styles
src/pages/
  ├── ServicePage.jsx                # +AI integration
  └── ServicePage.css                # +Processing indicator
```

---

## ⚠️ Important Notes

### Current Implementation
The serverless function has **placeholder image processing** logic. You need to:
1. Test with your actual Gemini API key
2. Verify the API response format
3. Update image extraction logic if needed

See `GEMINI_SETUP.md` for detailed instructions.

### Costs
- **Free tier**: 1500 requests/day
- **Paid tier**: ~$0.04 per enhancement
- **Estimated**: $12-120/month depending on usage

### Testing Commands
```bash
# Local development (with API functions)
npx vercel dev

# Frontend only (API won't work)
npm run dev

# Build for production
npm run build
```

---

## 🆘 Need Help?

### Common Issues

**"Service unavailable"**
→ Check API key in .env.local or Vercel settings

**"API calls fail locally"**
→ Use `vercel dev` not `npm run dev`

**"Enhancement takes forever"**
→ Normal for large images, wait up to 60 seconds

### Documentation
- **Full Setup**: See `GEMINI_SETUP.md`
- **Plan Details**: See plan document
- **Gemini Docs**: https://ai.google.dev/docs

---

## ✅ Ready to Test!

1. Create `.env.local` with your API key
2. Run `npx vercel dev`
3. Upload a photo on any service page
4. Select an enhancement style
5. Watch the magic happen! ✨
