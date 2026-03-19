# Sarvhit — Impact Platform

Connecting **NGOs**, **Volunteers**, and **Sponsors** on a single platform for social impact.

## Tech Stack

- **React 18** + **Vite**
- **React Router v6** — client-side routing
- **Framer Motion** — spring-based animations
- **Lucide React** — icon library
- **React Leaflet** — interactive impact map

## Project Structure

```
src/
├── components/ui/       # Reusable UI components (StatCard, ProgressBar, etc.)
├── context/             # React contexts (AuthContext)
├── data/                # Mock data & constants
├── hooks/               # Custom hooks & animation presets
├── layouts/AppLayout/   # App shell — sidebar, topbar
├── pages/               # Feature pages, each in own folder
│   ├── Landing/
│   ├── Auth/
│   ├── Dashboard/
│   ├── Events/
│   ├── Profile/
│   ├── ImpactMap/
│   ├── Discover/
│   └── Settings/
├── styles/              # Global CSS — tokens, reset, utilities
├── utils/               # Formatting helpers
├── App.jsx              # Router config
└── main.jsx             # Entry point
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Roles

| Role | Accent | Key Features |
|------|--------|-------------|
| NGO | Green | Create events, manage volunteers, track funds |
| Volunteer | Amber | Browse events, log hours, earn badges |
| Sponsor | Purple | Fund projects, view impact reports, tax receipts |
