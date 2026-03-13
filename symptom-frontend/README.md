# SymptomAI — Frontend (Vite + React)

Multi-page React app built with **Vite**, React Router v6, Axios, Lucide icons, and react-hot-toast.

---

## ⚡ Vite vs CRA — Key Differences

| Feature              | Create React App         | Vite (this project)              |
|----------------------|--------------------------|----------------------------------|
| Entry file           | `src/index.js`           | `src/main.jsx`                   |
| `index.html`         | `public/index.html`      | `index.html` at project root     |
| Env variable prefix  | `REACT_APP_`             | `VITE_`                          |
| Env variable access  | `process.env.REACT_APP_X`| `import.meta.env.VITE_X`         |
| Config file          | none                     | `vite.config.js`                 |
| Dev command          | `npm start`              | `npm run dev`                    |
| Build command        | `npm run build`          | `npm run build`                  |
| Dev server proxy     | `"proxy"` in package.json| `server.proxy` in vite.config.js |
| Module type          | CommonJS                 | ES Modules (`"type": "module"`)  |
| Cold start           | ~10s                     | ~300ms                           |

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd symptom-frontend
npm install

# 2. Set environment variables
cp .env.example .env
# Edit .env — set VITE_API_URL to your backend

# 3. Start development server
npm run dev
# Opens at http://localhost:3000

# 4. Build for production
npm run build
# Output in /dist folder
```

---

## 🔑 Environment Variables

```env
# .env  (uses VITE_ prefix — NOT REACT_APP_)
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_KEY=AIza...
```

> ⚠️ Never prefix with `REACT_APP_` in Vite — it won't work.
> Access in code: `import.meta.env.VITE_API_URL`

---

## 📁 Project Structure

```
symptom-frontend/
├── index.html                        ← Vite entry (root, NOT /public)
├── vite.config.js                    ← Vite config + dev proxy
├── package.json                      ← "type": "module" for ESM
├── .env.example                      ← VITE_ prefixed env vars
└── src/
    ├── main.jsx                      ← ReactDOM.createRoot entry
    ├── App.jsx                       ← Router + auth guards + toasts
    ├── index.css                     ← Global styles + CSS tokens
    ├── context/
    │   └── AuthContext.jsx           ← Global user/token state
    ├── services/
    │   └── api.js                    ← Axios + all API endpoints
    ├── components/
    │   ├── layout/
    │   │   ├── AppLayout.jsx         ← Sidebar + Header + <Outlet />
    │   │   ├── Sidebar.jsx           ← Collapsible nav with active states
    │   │   └── Header.jsx            ← Sticky top bar + Cmd+K trigger
    │   ├── ui/
    │   │   ├── index.jsx             ← GlassCard, Badge, Spinner, EmptyState
    │   │   └── CommandSearch.jsx     ← Cmd+K overlay with keyboard nav
    │   └── shared/
    │       └── AuthForm.jsx          ← Centered auth card shell
    └── pages/
        ├── LoginPage.jsx             ← Email + password login
        ├── RegisterPage.jsx          ← New account + email sent state
        ├── ForgotPasswordPage.jsx    ← Send reset email
        ├── ResetPasswordPage.jsx     ← New password via token
        ├── VerifyEmailPage.jsx       ← Auto-verify from email link
        ├── DashboardPage.jsx         ← Bento stats + recent activity
        ├── SymptomCheckerPage.jsx    ← Tag picker → OpenAI → result card
        ├── DoctorFinderPage.jsx      ← Geolocation + Maps + booking modal
        ├── HistoryPage.jsx           ← Paginated log, expand/delete
        ├── BookingsPage.jsx          ← Upcoming vs past + cancel
        ├── RemindersPage.jsx         ← Medication CRUD + time picker
        └── ProfilePage.jsx           ← Edit name + health profile
```

---

## 🔌 Backend Connection

The `vite.config.js` proxies `/api` requests to `http://localhost:5000` during development:

```js
// vite.config.js
server: {
  proxy: {
    '/api': { target: 'http://localhost:5000', changeOrigin: true }
  }
}
```

This means in dev you can just use `/api` as the base URL and avoid CORS issues entirely.

---

## 🔐 Auth Flow

1. Register → backend sends verification email → user clicks link → `/verify-email`
2. Login → JWT stored in `localStorage` + `AuthContext`
3. Every request: Axios interceptor auto-attaches `Authorization: Bearer <token>`
4. 401 response → token cleared → redirect to `/login`
5. Page refresh → `AuthContext` re-validates via `GET /api/auth/me`

---

## 🎨 Design System

CSS tokens in `src/index.css` — change once, updates everywhere:

```css
--accent:       #6366f1   /* indigo-500 — primary color  */
--bg:           #0f172a   /* slate-900  — background     */
--surface:      #1e293b   /* slate-800  — card surface   */
--green:        #10b981   /* success / low risk          */
--yellow:       #f59e0b   /* warning / moderate risk     */
--red:          #ef4444   /* danger / high risk          */
--font-display: 'Syne'    /* headings                    */
--font-body:    'DM Sans' /* body text                   */
```

---

## 🌐 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
npm run build
vercel --prod
```

Add `VITE_API_URL=https://your-backend.onrender.com/api` in Vercel's Environment Variables dashboard.

> For client-side routing to work on Vercel, add a `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```
