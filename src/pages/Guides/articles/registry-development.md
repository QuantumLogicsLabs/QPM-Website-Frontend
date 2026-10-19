The QPM registry is two open-source services: a React frontend (this site) and an Express API. This guide gets both running on your machine so you can fix a bug or build a feature.

## What you need

- **Node.js 18 or newer** and npm
- **Git**
- **MongoDB** (optional). The API falls back to `mongodb://127.0.0.1:27017/qpm_registry` and keeps running if no database is reachable.
- **Google Drive credentials** (optional). Without them, uploads return mock file IDs, so the whole publish flow still works locally.

## 1. Clone the repositories

The [QPM-Website](https://github.com/QuantumLogicsLabs/QPM-Website) meta-repo pulls in the frontend and backend as git submodules:

```bash
git clone --recurse-submodules https://github.com/QuantumLogicsLabs/QPM-Website.git qpm
cd qpm
```

Already cloned without submodules? Run `git submodule update --init --recursive`.

To contribute, fork the repository you're changing ([frontend](https://github.com/QuantumLogicsLabs/QPM-Website-Frontend) or [backend](https://github.com/QuantumLogicsLabs/QPM-Website-Backend)) and add your fork as a remote inside that submodule:

```bash
cd frontend
git remote add fork https://github.com/<you>/QPM-Website-Frontend.git
```

## 2. Start the API

```bash
cd backend
npm install
cp .env.example .env
npm run dev          # http://localhost:8000
```

Open `http://localhost:8000/api/health` to check it's up. It reports the database and storage status.

The most useful `.env` keys:

| Key | Notes |
|---|---|
| `PORT` | Defaults to `8000`. The frontend dev proxy expects this. |
| `MONGO_URI` | Your MongoDB connection string. |
| `JWT_SECRET` | Signs login tokens. Any value works locally. |
| `GOOGLE_OAUTH_*`, `GOOGLE_DRIVE_FOLDER_ID` | Only needed to store real tarballs in Drive. |

## 3. Start the website

In a second terminal:

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

The dev server proxies `/api` to `http://localhost:8000`, so keep the API running alongside it.

## 4. Point the CLI at your local registry

To test the full loop with the real `qpm` CLI, override the registry for a session:

```bash
# bash / zsh
export QPM_REGISTRY=http://localhost:8000/api/registry/

# PowerShell
$env:QPM_REGISTRY = "http://localhost:8000/api/registry/"
```

Or pass `--registry <url>` to a single command. Then `qpm login`, `qpm publish` and `qpm install` talk to your machine instead of the live registry.

## How the frontend is organised

```text
src/
├── api/          fetch helpers for the registry API
├── app/          router, layout and error pages
├── components/   shared UI: layout, package cards, buttons, inputs
├── context/      auth and toast providers
├── hooks/        small reusable hooks
├── pages/        one folder per route, each code-split
├── styles/       design tokens and global CSS
└── utils/        formatting, validation and snippet helpers
```

A few conventions to follow:

- **CSS Modules with design tokens.** Use the variables in `styles/tokens.css` (`--space-4`, `--text-muted` and so on) instead of hard-coded values, so both themes keep working.
- **Reuse the UI kit.** `Button`, `Input`, `EmptyState` and friends live in `components/ui`.
- **Pages are lazy-loaded.** Register new routes in `app/router.js` with the `page()` helper.
- **Guides are Markdown.** Articles like this one live in `pages/Guides/articles/`, with their titles in `pages/Guides/guides.js`.

## Before you open a pull request

```bash
npm run lint
npm run build
```

Both should pass. Then check your change in light and dark themes and at phone width, and open the pull request against `main` with a short description and screenshots for visual changes. See [How to contribute](/guides/contributing) for the full workflow.
