# AI Code Optimization Agent

A full-stack AI agent that optimizes code in real-time and automates GitHub repository file optimization.

---

## Project Structure

```
ai-code-optimizer/
├── backend/                  # Node.js + Express API
│   ├── controllers/
│   │   └── optimizeController.js
│   ├── routes/
│   │   └── optimize.js
│   ├── services/
│   │   ├── aiService.js
│   │   └── githubService.js
│   ├── server.js
│   ├── .env.example
│   ├── render.yaml
│   └── package.json
└── frontend/                 # React + Vite + TailwindCSS
    ├── src/
    │   ├── api/
    │   │   └── client.js
    │   ├── components/
    │   │   ├── Loader.jsx
    │   │   └── ScoreRing.jsx
    │   ├── pages/
    │   │   ├── CodeOptimizer.jsx
    │   │   └── RepoOptimizer.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── vercel.json
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## Local Development Setup

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env and fill in your keys (see below)
npm install
npm run dev
```

Backend runs at: `http://localhost:3001`

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env: set VITE_API_URL=http://localhost:3001
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Environment Variables

### Backend `.env`

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
FRONTEND_URL=http://localhost:5173
GITHUB_TOKEN=your_github_personal_access_token_here
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:3001
```

For production, set `VITE_API_URL` to your deployed Render backend URL.

---

## How to Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey) and sign in with your Google account
2. Create a new API key
3. Copy the key
4. Paste it into `GEMINI_API_KEY` in `backend/.env`

> The API key is stored server-side only and is never exposed to the frontend.

---

## How to Generate a GitHub Personal Access Token (PAT)

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **Generate new token (classic)**
3. Set expiration (e.g., 90 days)
4. Check the **`repo`** scope (full control of private repositories)
5. Click **Generate token** and copy it immediately
6. Paste it into `GITHUB_TOKEN` in `backend/.env`

---

## API Endpoints

### `POST /api/optimize-code`

Optimizes a code snippet using the AI agent.

**Request:**
```json
{
  "code": "function add(a, b) { return a + b }",
  "language": "JavaScript"
}
```

**Response:**
```json
{
  "score": 87,
  "comments": ["Added input validation", "Improved naming"],
  "optimizedCode": "..."
}
```

---

### `POST /api/optimize-repo`

Fetches a file from GitHub, optimizes it, and commits to a new branch.

**Request:**
```json
{
  "repoUrl": "https://github.com/user/repo",
  "filePath": "src/utils/helpers.js"
}
```

**Response:**
```json
{
  "score": 92,
  "comments": ["Reduced time complexity from O(n²) to O(n)"],
  "optimizedCode": "...",
  "branch": "optimized/helpers.js",
  "message": "Optimized code committed to branch: optimized/helpers.js"
}
```

---

## Deploying Backend to Render (Free Tier)

1. Push `backend/` folder to a GitHub repository
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Configure:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add Environment Variables:
   - `GEMINI_API_KEY` → your Gemini API key
   - `FRONTEND_URL` → your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
   - `NODE_ENV` → `production`
6. Deploy — Render provides a URL like `https://your-backend.onrender.com`

---

## Deploying Frontend to Vercel (Free Tier)

1. Push `frontend/` folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your frontend repo
4. Framework: **Vite** (auto-detected)
5. Add Environment Variable:
   - `VITE_API_URL` → your Render backend URL (e.g., `https://your-backend.onrender.com`)
6. Deploy

---

## CORS Configuration

The backend is configured to allow requests from:
- `http://localhost:5173` (local development)
- Any `*.vercel.app` domain

To add custom domains, update the `allowedOrigins` array in `backend/server.js` or use the `FRONTEND_URL` environment variable.

---

## Security Notes

- API keys are stored in backend `.env` only — never in frontend code
- GitHub PAT is transmitted over HTTPS and never persisted
- Input validation is applied to all endpoints
- CORS restricts access to known origins only
