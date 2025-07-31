# Public Assets

This directory contains static assets for the Farcaster Prediction Markets app.

## Required Image Files

### 1. icon.png
- **Purpose**: App icon shown in Farcaster app directory and browser tabs
- **Size**: 512x512px (recommended)
- **Format**: PNG with transparent background
- **Design suggestions**: 
  - Use your app logo
  - Include a chart/prediction theme
  - Keep it simple and recognizable at small sizes

### 2. splash.png  
- **Purpose**: Splash image shown when your frame loads in Farcaster
- **Size**: 1200x630px (Open Graph standard)
- **Format**: PNG
- **Design suggestions**:
  - Include your app name
  - Show key features visually
  - Use your brand colors (purple/gray theme)
  - Add tagline: "Bet on crypto price movements"

### 3. og-default.png
- **Purpose**: Default Open Graph image for social sharing
- **Size**: 1200x630px (Open Graph standard)
- **Format**: PNG
- **Design suggestions**:
  - Similar to splash.png but more generic
  - Include app branding
  - Show market/prediction visual elements
  - Text should be readable on social media

## How to Create These Images

### Option 1: Use Canva (Free)
1. Go to [Canva.com](https://www.canva.com)
2. Search for templates:
   - "App Icon" for icon.png
   - "Facebook Cover" or "Social Media" for splash/og images
3. Customize with your colors:
   - Primary: #8b5cf6 (Purple)
   - Background: #111827 (Dark Gray)
   - Accent: #10b981 (Green for YES)
   - Accent: #ef4444 (Red for NO)

### Option 2: Use Figma (Free)
1. Create frames with exact dimensions
2. Design your images
3. Export as PNG

### Option 3: Quick Placeholder Generator
Use these services to create temporary placeholders:
- [Placeholder.com](https://placeholder.com) - Simple placeholders
- [Banner.cool](https://banner.cool) - Quick banner generator
- [Favicon.io](https://favicon.io) - Icon generator

### Option 4: AI Generation
Use AI tools to generate:
- DALL-E 3 / Midjourney: "Minimalist crypto prediction market app icon, purple and dark theme"
- Ideogram.ai: Good for text-based designs

## Quick Placeholder Commands

If you need placeholder images immediately:

```bash
# Create placeholder images using ImageMagick (if installed)
convert -size 512x512 xc:#8b5cf6 -pointsize 200 -fill white -gravity center -annotate +0+0 "PM" public/icon.png
convert -size 1200x630 xc:#111827 -pointsize 72 -fill white -gravity center -annotate +0+0 "Prediction Markets" public/splash.png
convert -size 1200x630 xc:#111827 -pointsize 60 -fill white -gravity center -annotate +0+0 "Crypto Prediction Markets" public/og-default.png
```

## Design Requirements

### Brand Colors
```css
--purple: #8b5cf6;
--dark-bg: #111827;
--gray-800: #1f2937;
--green: #10b981;
--red: #ef4444;
--text: #ffffff;
```

### Fonts
- Primary: System UI / Inter
- Monospace: For prices/numbers

### Visual Elements to Include
- Chart/graph icons
- Up/down arrows
- Crypto symbols (₿ Ξ)
- YES/NO buttons
- Base chain logo (optional)

## File Checklist
- [ ] icon.png (512x512px)
- [ ] splash.png (1200x630px)  
- [ ] og-default.png (1200x630px)

## Note
These images are required for the app to work properly with Farcaster frames. You can start with simple placeholders and improve them later.