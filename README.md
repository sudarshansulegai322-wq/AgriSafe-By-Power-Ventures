# AgriSafe by Power Ventures 🌱🛡️

> **Next-Generation Agricultural Input Authenticity Verification & Farmer Protection Platform**
> 
> Real-time seed/chemical barcode & hologram verification, chemical compatibility tank-mix matrix, multi-lingual AI voice assistant in 10 Indian languages, certified rural marketplace with DBT/subsidy calculations, and District Krishi Kendra Sahayak network.

---

## 🚀 Live Deployment on Vercel

This repository is pre-configured for instant zero-configuration deployment on **[Vercel](https://vercel.com)**:

1. **Import the repository** into Vercel via GitHub.
2. Under **Project Settings > Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API Key from Google AI Studio.
3. Click **Deploy**.
   - Frontend is built automatically with `vite build`.
   - API endpoints (`/api/*`) run seamlessly via Vercel Serverless Functions (`/api/index.ts`).

---

## 💻 Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your `GEMINI_API_KEY` in `.env`.

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📦 Pushing to GitHub

To push this codebase to a new repository on GitHub:

```bash
# 1. Initialize git and stage files
git init -b main
git add .
git commit -m "Initial commit: AgriSafe by Power Ventures"

# 2. Link your GitHub repository
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git

# 3. Push to GitHub
git push -u origin main
```

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons.
- **Backend**: Express on Node.js / Vercel Serverless Functions.
- **AI & Speech**: Google Gemini API (@google/genai) with multi-dialect support (Hindi, Marathi, Punjabi, Tamil, Telugu, Kannada, Gujarati, Bengali, Odia, English).
- **Security & Integrity**: SeedTrace cryptographic batch validation, CIBRC chemical tank-mix matrix, and audit logging.
