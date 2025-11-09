# Deployment Guide

## 🚀 Quick Start - Deploy to GitHub Pages

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `ArcRaidersLootList`
3. **DO NOT** initialize with README, .gitignore, or license (we already have these)

### 2. Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ArcRaidersLootList.git

# Push code
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **GitHub Actions**
4. The deploy workflow will run automatically on every push

### 4. Configure Repository Secrets (Optional)

If you want to enable automated data updates:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. The workflows use default GitHub tokens, so no additional setup is needed

### 5. Access Your App

After the deployment workflow completes (check the **Actions** tab), your app will be live at:

```
https://YOUR_USERNAME.github.io/ArcRaidersLootList/
```

## 🔄 Automated Data Updates

The app automatically updates game data:
- **Schedule**: Daily at 6 AM UTC
- **Source**: RaidTheory/arcraiders-data GitHub repository
- **Workflow**: `.github/workflows/update-data.yml`

### Manual Data Update

To manually trigger a data update:
1. Go to **Actions** tab on GitHub
2. Select "Update Game Data" workflow
3. Click "Run workflow"

## 🛠️ Local Development

### Prerequisites

- Node.js 20+ installed
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Fetch game data
npm run fetch-data

# Start development server
npm run dev
```

The app will be available at: `http://localhost:3000/ArcRaidersLootList/`

### Build for Production

**Note**: There's a known npm bug with Windows and Rollup optional dependencies. The project includes a workaround with `@rollup/rollup-win32-x64-msvc` as a dev dependency.

```bash
# Build
npm run build

# Preview build
npm run preview
```

## 📝 Customization

### Update Base Path

If you're deploying to a different subdirectory or custom domain:

1. Open `vite.config.ts`
2. Change the `base` property:
   ```typescript
   base: '/your-repo-name/' // or '/' for custom domain
   ```

### Update Repository Info

1. Open `README.md`
2. Replace `YOUR_USERNAME` with your GitHub username
3. Update badges and links

## 🔧 Troubleshooting

### Build Fails on Windows

If you get Rollup errors:
```bash
npm install @rollup/rollup-win32-x64-msvc --save-dev
```

### Data Not Loading

Check that:
1. `public/data/` directory contains JSON files
2. Run `npm run validate-data` to check data integrity
3. Check browser console for errors

### GitHub Actions Failing

1. Check the Actions tab for error messages
2. Ensure GitHub Pages is enabled in repository settings
3. Verify workflow permissions are set correctly

## 📊 Performance Tips

1. **Enable Caching**: The app uses localStorage for user progress
2. **Image Optimization**: Icons are already optimized, but you can further compress them if needed
3. **Bundle Size**: The app code-splits Fuse.js for better initial load times

## 🎨 Styling Updates

All styles are in `src/styles/main.css`. The design follows Arc Raiders' visual aesthetic:
- Dark theme with neon cyan accents
- Barlow and Barlow Semi Condensed fonts
- Decision-based color coding

## 📦 Data Sources

The app pulls data from:
- [RaidTheory/arcraiders-data](https://github.com/RaidTheory/arcraiders-data)
- Data updates automatically daily via GitHub Actions

## 🐛 Known Issues

1. **Rollup Windows**: Optional dependencies issue with npm on Windows (workaround included)
2. **First Load**: May take a moment to load all icons on first visit

## 🤝 Contributing

Feel free to:
- Report bugs via GitHub Issues
- Submit pull requests for improvements
- Suggest new features

---

Made with ⚡ for the Arc Raiders community
