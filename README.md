# Private Charge - EVzone Private Charging Management

A React-based mobile-first application for managing private EV charging stations.

## Features

- 📱 Mobile-first design (420px optimized)
- 🔌 Charger management and configuration
- ⚡ Live charging session monitoring
- 💰 Pricing and fee management
# EVzone — Private Charging (EVzone Private Charging Management)

A mobile-first React application for managing private and commercial EV chargers, sessions, pricing and access control. The app provides charger onboarding (including OCPP), live session telemetry and summaries, pricing (single/TOU) with CSV/API imports, scheduling and access management, analytics, and billing workflows.

**Status:** Internal / Proprietary (EVzone)

---

## Key features

- Mobile-first admin UI optimized for 420px screens
- Charger onboarding & OCPP configuration
- Live charging session monitoring, sparklines and session summaries
- Pricing models and TOU (time-of-use) import support
- Scheduling, availability and access control (guest passes, user permissions)
- Analytics, CO2 savings estimates and exportable reports
- Payments & billing integration hooks

---

## Tech stack

- React 18 (Create React App)
- Material UI (MUI) for components
- React Router for routing
- Axios for HTTP clients
- Maps: Pigeon Maps / custom map components

---

## Quick start

Prerequisites:

- Node.js >= 18
- npm >= 9

Install and run locally:

```bash
git clone <repo-url>
cd private-charge
npm install

# copy or create .env with appropriate API / OCPP urls
cp .env.example .env || true

npm start
```

By default, the development server runs at `http://localhost:3000`.

Environment variables used by the app (examples):

```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_OCPP_SERVER_URL=wss://ocpp.example.com
REACT_APP_ENV=development
```

---

## Project structure (high level)

- `src/` — application source
	- `App.js` — application entry and routing
	- `index.js` / `index.css` — app bootstrap and global styles
	- `components/` — reusable UI components and shared layout
		- `layout/MobileShell.jsx` — mobile-first container used across screens
		- `common/` — small helpers: `MapPicker`, `GeoSearch`, `Sparkline` etc.
	- `screens/` — feature screens organized by domain (chargers, sessions, pricing, settings, analytics, access, etc.)
		- `screens/chargers/ConnectCharger.jsx` — charger onboarding flow
		- `screens/sessions/ChargingLiveSession.jsx` — live session UI
		- `screens/settings/UtilityTOUImports.jsx` — TOU import utilities
	- `services/api/` — API wrappers (chargers, sessions)
	- `hooks/` — custom React hooks (e.g. `useCharger`, `useGeolocation`)
	- `utils/` — `constants.js`, `theme.js` and shared helpers

---

## Development notes and conventions

- Keep UI components small and focused; prefer composition over large monoliths.
- Use custom hooks in `src/hooks/` for shared logic (data fetching, geolocation, etc.).
- Use `MobileShell` for consistent mobile layout constraints and header/footer.
- Keep styles consistent via `src/utils/theme.js`.
- If adding large features, add screens under `src/screens/<feature>/`.

Suggested npm scripts (check `package.json`): `start`, `build`, `test`, `lint`, `format`.

---

## Useful entry points & references

- App entry: `src/App.js`
- Theme: `src/utils/theme.js`
- Layout: `src/components/layout/MobileShell.jsx`
- Charger onboarding: `src/screens/chargers/ConnectCharger.jsx`
- Live session UI: `src/screens/sessions/ChargingLiveSession.jsx`
- TOU import: `src/screens/settings/UtilityTOUImports.jsx`

---

## Suggestions / next steps

- Add a `.env.example` with required variables to make onboarding easier.
- Add CI (GitHub Actions) with linting and build checks.
- Add smoke tests for core flows (login, charger onboarding, session view).
- Consider documenting API contracts or adding a small mock server for local development.

---

## License

Proprietary — EVzone. Not for public redistribution.

---
