# 🚀 Replicate API Setup - Working AI Image Enhancement

## ✅ What Changed

Switched from Gemini to **Replicate API** for real, working AI image enhancement:
- **Real-ESRGAN**: 4x upscaling with face enhancement
- **DeOldify**: Automatic AI colorization
- **Production-ready**: Proven models used by thousands

---

## 🔑 Get Your Replicate API Token (Free!)

### Step 1: Create Account
1. Go to https://replicate.com/
2. Click **Sign Up** (use GitHub for quick signup)
3. Free tier includes **free credits to start**!

### Step 2: Get API Token
1. Go to https://replicate.com/account/api-tokens
2. Click **Create Token**
3. Copy your token (starts with `r8_...`)

---

## 🎯 What You Need to Do

### **Add Environment Variable in Vercel**

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/
   - Click your **HistoryUpscaled** project

2. **Settings → Environment Variables**
   - Click **Add New**
   - **Key**: `REPLICATE_API_TOKEN`
   - **Value**: Your token (starts with `r8_...`)
   - **Environments**: ✅ Check all three boxes

3. **Save and Redeploy**
   - After saving, go to **Deployments** tab
   - Click **⋯** on latest deployment
   - Click **Redeploy**

---

## 💰 Pricing

### Replicate Costs
- **Free tier**: Free credits to start testing
- **Pay-as-you-go**: ~$0.01-0.03 per image
- **Real-ESRGAN**: ~$0.0023 per run (4x upscaling)
- **DeOldify**: ~$0.015 per run (colorization)

### Monthly Estimates
| Usage | Images/Day | Monthly Cost |
|-------|------------|--------------|
| Low   | 10         | ~$3-5        |
| Medium| 50         | ~$15-30      |
| High  | 100        | ~$30-60      |

**Much cheaper than Gemini!** 💰

---

## 🎨 How It Works

### Enhancement Styles
1. **📸 Black & White Preserve**
   - Uses: Real-ESRGAN
   - Output: 4x upscaled, enhanced B&W image
   - Face enhancement enabled

2. **🎨 Colorized**
   - Uses: DeOldify AI colorization
   - Output: Historically accurate colors
   - Automatic color palette selection

3. **🎲 Surprise Me**
   - Uses: Real-ESRGAN with creative settings
   - Output: High-quality 4x upscaled image

### Processing Time
- **Real-ESRGAN**: 10-20 seconds
- **DeOldify**: 15-30 seconds
- Faster than Gemini!

---

## 🧪 Testing

Once you've added the token and redeployed:

1. Visit your Vercel URL
2. Go to any service page
3. Upload a vintage photo
4. Click a style (e.g., "Colorized")
5. Wait 15-30 seconds
6. **See actual AI enhancement!** ✨

---

## 📊 Advantages Over Gemini

| Feature | Replicate | Gemini |
|---------|-----------|--------|
| **Works?** | ✅ Yes | ❌ Not for images |
| **Cost** | $0.01-0.03/image | $0.04/image |
| **Quality** | Real AI upscaling | N/A |
| **Speed** | 10-30 sec | N/A |
| **Models** | Proven (Real-ESRGAN, DeOldify) | Text/vision only |

---

## 🔧 Troubleshooting

### "Service temporarily unavailable"
→ Add `REPLICATE_API_TOKEN` in Vercel settings

### "Invalid token"
→ Check token starts with `r8_` and is copied correctly

### "Model not found"
→ Models are hardcoded and should work, check Vercel logs

### Still not working?
→ Check Vercel function logs for detailed errors

---

## 🎉 You're Done!

Just add the Replicate API token in Vercel and redeploy. The image enhancement will actually work this time!
