# QPM-Website-Frontend

The web UI for the QPM registry: search, package pages, publishing (tarball upload or GitHub import) and the author dashboard.

**Stack:** React 19 · Vite 8 · React Router 8 · CSS Modules · `react-markdown` · `lucide-react` · `canvas-confetti`

## Getting started

Requires Node.js 22.12+ (React Router 8 declares 22.22+).

```bash
npm install
npm run dev       # http://localhost:3000, proxies /api → http://localhost:8000
npm run build     # production build → dist/
npm run preview   # serve the build locally
npm run lint      # ESLint (flat config, React hooks + refresh rules)
```

Run the backend alongside it. To point a production build at a different API origin, set `VITE_API_BASE_URL` (defaults to `/api`).

## Project structure

```
public/                 Static files served as-is (logo.svg, site.webmanifest, robots.txt)
src/
  main.jsx              Entry: global CSS + createRoot
  app/                  App shell: providers, route table (lazy pages), layout, error boundary
  api/                  All HTTP calls. client.js (fetch + XHR upload), auth.js, registry.js
  context/              AuthProvider (session + sign-in modal), ToastProvider (portal toasts)
  hooks/                useAuth, useToast, useResource (abortable data loading), useClipboard, …
  components/
    ui/                 Design-system primitives: Button, Field, Input, Modal, Tabs, Badge, …
    layout/             Navbar, UserMenu, SearchBar, Footer, Logo, NavigationProgress
    package/            PackageCard, PackageGrid, Markdown
    auth/               AuthModal
  pages/<Page>/         One folder per route, with its own sub-components and styles
  styles/               tokens.css (design tokens), base.css, utilities.css
  utils/                Formatting, validation, sorting, class-name helpers
```

## Conventions

- **Imports** use the `@/` alias for `src/` (configured in `vite.config.js` and `jsconfig.json`).
- **Styling:** every component has a sibling `*.module.css`. Use the tokens in `src/styles/tokens.css` for colors, spacing, radii and motion. Don't hard-code new values.
- **Data:** pages call functions from `src/api/` through `useResource`; they never call `fetch` directly. The API layer normalizes backend responses into one shape.
- **React 19 APIs in use:** `<title>` metadata (`PageMeta`), `ref` as a prop, `use(Context)`, `<Context value>`, `useEffectEvent`, `useActionState` plus react-dom's `useFormStatus` (auth form), and `createPortal` (modal, toasts).
- **Routing:** pages are lazy-loaded route modules, so each page is its own chunk. UI state that should survive a refresh or be shareable (search query, sort, active tab, publish method) lives in the URL.

---

Created by a Commander on QuantumLogics Community.
