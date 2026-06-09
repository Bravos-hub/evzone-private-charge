# EVzone Private Charging — Agent Guide

This document is written for AI coding agents. It describes the project architecture, conventions, and operational details you need to make safe, correct changes.

---

## Project Overview

EVzone Private Charging is a **React 18 single-page application** for managing private and commercial EV chargers, charging sessions, pricing, access control, and analytics. It is an internal proprietary product (EVzone).

The UI is **mobile-first** and optimized for a 420 px viewport width. It is not a responsive desktop app; screens are designed to look like a mobile app even on larger displays (centered frame with max-width constraints).

The codebase contains roughly **11,700 lines** of JSX/JS across 50+ screen components.

---

## Technology Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 (Create React App) |
| Build Tool | react-scripts 5.x, customized via **CRACO** 7.x |
| UI Library | Material UI (MUI) v5 |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Maps | Pigeon Maps |
| QR Scanning | html5-qrcode |
| Date Utils | date-fns |
| Linting | ESLint 8.x (react-app, react-app/jest, react, react-hooks) |
| Formatting | Prettier 3.x |
| Node | >= 18.0.0 |
| npm | >= 9.0.0 |

---

## Project Structure

```
build/                  # Production build output (static files, ignored in git)
public/
  assets/               # Maskable icons and apple-touch-icons
  index.html            # CRA HTML template (Inter font from Google, theme-color #03cd8c)
  manifest.json         # PWA manifest
src/
  App.js                # Root component: ThemeProvider, BrowserRouter, ErrorBoundary, OnboardingProvider
  index.js              # React 18 createRoot bootstrap
  index.css             # Global styles, scrollbar theming, mobile font-size tweak
  routes/
    index.jsx           # All <Route> declarations (50+ routes, CRLF line endings)
    PrivateRoute.jsx    # Auth guard (currently hard-coded pass-through — see Security)
  components/
    common/             # Reusable helpers: ErrorBoundary, GeoSearch, MapPicker, QRScanner, Sparkline, Stat
    forms/              # Multi-step form components: ChargerForm, ConnectorForm, OCPPPanel, PricingForm
    layout/
      MobileShell.jsx   # Primary mobile layout shell (app bar, bottom nav, max-width 420)
    modals/             # AddChargerModal, ConfirmDialog, SwitchCommercialModal
    onboarding/
      OnboardingOverlay.jsx
  context/
    OnboardingContext.jsx   # Step-by-step onboarding state (persisted to localStorage)
  hooks/
    useCharger.js       # Fetch single charger by ID
    useChargers.js      # Fetch + refetch charger list
    useGeolocation.js
    useGreeting.js
  screens/              # One folder per feature domain (~50 components, ~11,700 lines total)
    access/             # Availability, AccessPermissions, AccessUserVehicles, GuestPassAccessCodes
    analytics/          # EnergyAnalytics, CO2SavingsImpact
    bookings/           # BookingsReservations
    chargers/           # MyChargers, AddCharger, ConnectCharger, ChargerDetails, ChargerSettings, ChargerSettingsAdvanced
    error/              # NotFound
    home/               # Home, Dashboard, Guide
    marketplace/        # OperatorMarketplace
    payments/           # PaymentMethods, InvoicesBilling
    pricing/            # PricingFees, PrePayOrder
    private/            # PrivateChargingControlCenter
    scheduling/         # Schedules, CreateOrEditSchedule
    sessions/           # ChargingHistory, ChargingLiveSession, SessionSummary, SessionSummaryB
    settings/           # Settings, OperatorSelection, SiteSelector, AddSite, AdvancedConfiguration,
                        # DiagnosticsLogs, FaultDetail, ConnectorManagement, FirmwareSelfTest,
                        # NotificationsRules, TroubleshootingWizard, MaintenanceReminders, AuditCommandLog,
                        # SupportHelpCenter, TariffTemplatesLibrary, UtilityTOUImports, ScheduleCalendars,
                        # SiteEditorAdvanced, MobileStationRequest, DataExportCenter, LanguageCurrency,
                        # OperatorShiftLogs, AggregatorCPMSBridge
    users/              # AccessUserProfile, QRPoster
    utilities/          # ReceiptViewer, StartByQRorID
    wallet/             # Wallet
  services/api/
    index.js            # Axios instance with interceptors (CRLF line endings)
    chargers.js         # chargerApi wrapper (CRLF line endings)
    privateCharging.js  # privateChargingApi + domain enums
    sessions.js         # sessionApi wrapper
  utils/
    constants.js        # App constants, nav items, feature flags (CRLF line endings)
    constants.test.js   # Jest tests for constants (one of the few test files)
    theme.js            # MUI theme + EV color palette object
```

---

## Environment Variables

The app reads **build-time** environment variables prefixed with `REACT_APP_`.

| Variable | Purpose | Example |
|----------|---------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:8000/api` or `/api/v1` |
| `REACT_APP_ENV` | Runtime environment label | `development` / `production` |
| `REACT_APP_OCPP_SERVER_URL` | OCPP WebSocket endpoint | `wss://ocpp.evzone.app` |

**Current `.env` (development):**
```
REACT_APP_API_URL=http://localhost:3000/api/v1
REACT_APP_OCPP_SERVER_URL=wss://ocpp.evzone.app
REACT_APP_ENV=development
```

**Current `.env.production`:**
```
REACT_APP_API_URL=https://api.evzonecharging.com
REACT_APP_ENV=production
VITE_APP_ENV=production
VITE_PUBLIC_BASE_URL=https://private.evzonecharging.com
VITE_API_URL=https://api.evzonecharging.com
VITE_KEYCLOAK_URL=https://auth.evzonecharging.com
VITE_KEYCLOAK_REALM=evzone
```

**Notes:**
- `.env` and `.env.production` exist in the repo but are **git-ignored** (they may contain secrets).
- There is **no `.env.example`** file committed yet, despite the README suggesting one.
- The GitHub Actions workflow also references `VITE_*` variables. These are infrastructure configuration for the deployment environment; the application code itself does not consume them directly.

---

## Build, Test, and Development Commands

All commands are run via `npm` (or `npx`).

```bash
# Install dependencies
npm install

# Start local dev server (http://localhost:3000)
npm start

# Production build (outputs to build/)
npm run build

# Run tests (Jest via react-scripts, interactive watch mode)
npm test

# Run tests once (CI mode)
npm test -- --watch=false

# Run linter (ESLint on src/)
npm run lint

# Format code (Prettier)
npm run format

# Eject from CRA (irreversible — do not use)
npm run eject
```

**Testing Reality Check:**
- The project has **one custom test file**: `src/utils/constants.test.js`.
- `npm test` will run Jest in interactive watch mode. Most of the suite will be the default CRA smoke test until more `*.test.js` or `*.test.jsx` files are added.
- If you add tests, place them adjacent to the source file (`ComponentName.test.jsx`) so CRA discovers them automatically.

---

## Code Style Guidelines

### Conventions Observed in the Codebase

1. **Functional components** with `export default function ComponentName(props)`.
2. **Custom hooks** live in `src/hooks/` and follow the `useXxx` naming convention.
3. **API wrappers** live in `src/services/api/` and export plain objects of functions (e.g., `chargerApi`, `sessionApi`, `privateChargingApi`).
4. **Constants / feature flags** are centralized in `src/utils/constants.js`.
5. **Theme values** are imported from `src/utils/theme.js` (`EVzoneTheme` or the `EV` color object). Avoid hard-coding hex values in screens.
6. **Mobile layout** is enforced via `MobileShell` or inline `maxWidth: 420, mx: 'auto'` containers.
7. **MUI `sx` prop** is the dominant styling method. Some inline `style` objects exist in older components (e.g., ErrorBoundary fallback UI).
8. **Event handlers** use optional chaining guards (`e?.preventDefault?.()`).
9. **Dev sanity checks** sometimes appear as `useEffect` blocks with `console.table` — do not remove existing ones if extending a component.
10. **Navigation sync pattern**: Screens that use `MobileShell` often keep a `navValue` state synced with `location.pathname` via `useMemo` route arrays and `useEffect`.

### Linting / Formatting

- ESLint config is declared inside `package.json` under `eslintConfig`.
- There are **no standalone `.eslintrc` or `.prettierrc` files**.
- Prettier is run manually via `npm run format`; it is not wired into a pre-commit hook.

### Line Endings

Some files (e.g., `src/routes/index.jsx`, `src/services/api/index.js`, `src/services/api/chargers.js`, `src/utils/constants.js`) contain **CRLF (`\r\n`)** line endings. Preserve the existing line ending style when editing those files.

---

## Key Patterns & Architecture Details

### API Client (`src/services/api/index.js`)

- Axios instance with `baseURL`, `timeout: 10000`, and `withCredentials: true`.
- **Request interceptor:** injects `x-tenant-id` header from `localStorage.getItem('activeTenantId')`.
- **Response interceptor:** dispatches a custom event `evzone:auth:expired` on HTTP 401. The app does not redirect automatically; something else must listen for this event.

### Authentication

- The shared EVzone backend authenticates via **httpOnly cookies**.
- `PrivateRoute` currently has authentication **disabled** (`const isAuthenticated = tru
```
build/                  # Production build output (static files, ignored in git)
public/
  assets/               # Maskable icons and apple-touch-icons
  index.html            # CRA HTML template (Inter font from Google, theme-color #03cd8c)
  manifest.json         # PWA manifest
src/
  App.js                # Root component: ThemeProvider, BrowserRouter, ErrorBoundary, OnboardingProvider
  index.js              # React 18 createRoot bootstrap
  index.css             # Global styles, scrollbar theming, mobile font-size tweak
  routes/
    index.jsx           # All <Route> declarations (50+ routes, CRLF line endings)
    PrivateRoute.jsx    # Auth guard (currently hard-coded pass-through — see Security)
  components/
    common/             # Reusable helpers: ErrorBoundary, GeoSearch, MapPicker, QRScanner, Sparkline, Stat
    forms/              # Multi-step form components: ChargerForm, ConnectorForm, OCPPPanel, PricingForm
    layout/
      MobileShell.jsx   # Primary mobile layout shell (app bar, bottom nav, max-width 420)
    modals/             # AddChargerModal, ConfirmDialog, SwitchCommercialModal
    onboarding/
      OnboardingOverlay.jsx
  context/
    OnboardingContext.jsx   # Step-by-step onboarding state (persisted to localStorage)
  hooks/
    useCharger.js       # Fetch single charger by ID
    useChargers.js      # Fetch + refetch charger list
    useGeolocation.js
    useGreeting.js
  screens/              # One folder per feature domain (~50 components, ~11,700 lines total)
    access/             # Availability, AccessPermissions, AccessUserVehicles, GuestPassAccessCodes
    analytics/          # EnergyAnalytics, CO2SavingsImpact
    bookings/           # BookingsReservations
    chargers/           # MyChargers, AddCharger, ConnectCharger, ChargerDetails, ChargerSettings, ChargerSettingsAdvanced
    error/              # NotFound
    home/               # Home, Dashboard, Guide
    marketplace/        # OperatorMarketplace
    payments/           # PaymentMethods, InvoicesBilling
    pricing/            # PricingFees, PrePayOrder
    private/            # PrivateChargingControlCenter
    scheduling/         # Schedules, CreateOrEditSchedule
    sessions/           # ChargingHistory, ChargingLiveSession, SessionSummary, SessionSummaryB
    settings/           # Settings, OperatorSelection, SiteSelector, AddSite, AdvancedConfiguration,
                        # DiagnosticsLogs, FaultDetail, ConnectorManagement, FirmwareSelfTest,
                        # NotificationsRules, TroubleshootingWizard, MaintenanceReminders, AuditCommandLog,
                        # SupportHelpCenter, TariffTemplatesLibrary, UtilityTOUImports, ScheduleCalendars,
                        # SiteEditorAdvanced, MobileStationRequest, DataExportCenter, LanguageCurrency,
                        # OperatorShiftLogs, AggregatorCPMSBridge
    users/              # AccessUserProfile, QRPoster
    utilities/          # ReceiptViewer, StartByQRorID
    wallet/             # Wallet
  services/api/
    index.js            # Axios instance with interceptors (CRLF line endings)
    chargers.js         # chargerApi wrapper (CRLF line endings)
    privateCharging.js  # privateChargingApi + domain enums
    sessions.js         # sessionApi wrapper
  utils/
    constants.js        # App constants, nav items, feature flags (CRLF line endings)
    constants.test.js   # Jest tests for constants (one of the few test files)
    theme.js            # MUI theme + EV color palette object
```


---

## Environment Variables

The app reads **build-time** environment variables prefixed with `REACT_APP_`.

| Variable | Purpose | Example |
|----------|---------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:8000/api` or `/api/v1` |
| `REACT_APP_ENV` | Runtime environment label | `development` / `production` |
| `REACT_APP_OCPP_SERVER_URL` | OCPP WebSocket endpoint | `wss://ocpp.evzone.app` |

**Current `.env` (development):**
```
REACT_APP_API_URL=http://localhost:3000/api/v1
REACT_APP_OCPP_SERVER_URL=wss://ocpp.evzone.app
REACT_APP_ENV=development
```

**Current `.env.production`:**
```
REACT_APP_API_URL=https://api.evzonecharging.com
REACT_APP_ENV=production
VITE_APP_ENV=production
VITE_PUBLIC_BASE_URL=https://private.evzonecharging.com
VITE_API_URL=https://api.evzonecharging.com
VITE_KEYCLOAK_URL=https://auth.evzonecharging.com
VITE_KEYCLOAK_REALM=evzone
```

**Notes:**
- `.env` and `.env.production` exist in the repo but are **git-ignored** (they may contain secrets).
- There is **no `.env.example`** file committed yet, despite the README suggesting one.
- The GitHub Actions workflow also references `VITE_*` variables. These are infrastructure configuration for the deployment environment; the application code itself does not consume them directly.


---

## Build, Test, and Development Commands

All commands are run via `npm` (or `npx`).

```bash
# Install dependencies
npm install

# Start local dev server (http://localhost:3000)
npm start

# Production build (outputs to build/)
npm run build

# Run tests (Jest via react-scripts, interactive watch mode)
npm test

# Run tests once (CI mode)
npm test -- --watch=false

# Run linter (ESLint on src/)
npm run lint

# Format code (Prettier)
npm run format

# Eject from CRA (irreversible — do not use)
npm run eject
```

**Testing Reality Check:**
- The project has **one custom test file**: `src/utils/constants.test.js`.
- `npm test` will run Jest in interactive watch mode. Most of the suite will be the default CRA smoke test until more `*.test.js` or `*.test.jsx` files are added.
- If you add tests, place them adjacent to the source file (`ComponentName.test.jsx`) so CRA discovers them automatically.


---

## Code Style Guidelines

### Conventions Observed in the Codebase

1. **Functional components** with `export default function ComponentName(props)`.
2. **Custom hooks** live in `src/hooks/` and follow the `useXxx` naming convention.
3. **API wrappers** live in `src/services/api/` and export plain objects of functions (e.g., `chargerApi`, `sessionApi`, `privateChargingApi`).
4. **Constants / feature flags** are centralized in `src/utils/constants.js`.
5. **Theme values** are imported from `src/utils/theme.js` (`EVzoneTheme` or the `EV` color object). Avoid hard-coding hex values in screens.
6. **Mobile layout** is enforced via `MobileShell` or inline `maxWidth: 420, mx: 'auto'` containers.
7. **MUI `sx` prop** is the dominant styling method. Some inline `style` objects exist in older components (e.g., ErrorBoundary fallback UI).
8. **Event handlers** use optional chaining guards (`e?.preventDefault?.()`).
9. **Dev sanity checks** sometimes appear as `useEffect` blocks with `console.table` — do not remove existing ones if extending a component.
10. **Navigation sync pattern**: Screens that use `MobileShell` often keep a `navValue` state synced with `location.pathname` via `useMemo` route arrays and `useEffect`.

### Linting / Formatting

- ESLint config is declared inside `package.json` under `eslintConfig`.
- There are **no standalone `.eslintrc` or `.prettierrc` files**.
- Prettier is run manually via `npm run format`; it is not wired into a pre-commit hook.

### Line Endings

Some files (e.g., `src/routes/index.jsx`, `src/services/api/index.js`, `src/services/api/chargers.js`, `src/utils/constants.js`) contain **CRLF (`\r\n`)** line endings. Preserve the existing line ending style when editing those files.


---

## Key Patterns & Architecture Details

### API Client (`src/services/api/index.js`)

- Axios instance with `baseURL`, `timeout: 10000`, and `withCredentials: true`.
- **Request interceptor:** injects `x-tenant-id` header from `localStorage.getItem('activeTenantId')`.
- **Response interceptor:** dispatches a custom event `evzone:auth:expired` on HTTP 401. The app does not redirect automatically; something else must listen for this event.

### Authentication

- The shared EVzone backend authenticates via **httpOnly cookies**.
- `PrivateRoute` currently has authentication **disabled** (`const isAuthenticated = true;`). It is a TODO. Do not assume real auth checks are active.

### MobileShell Layout

- `MobileShell` provides a fixed gradient app bar, a scrollable main content area capped at 420 px, an optional footer slot, and a sticky bottom navigation bar.
- It is used across most screens for consistent mobile framing.
- Bottom nav items: Home, Stations, Sessions, Wallet, Settings.

### Onboarding Flow

- `OnboardingContext` manages a 5-step onboarding wizard.
- State is mirrored to `localStorage` so it survives refreshes.
- Steps reference routes like `/chargers/add`, `/chargers/:id/settings`, `/payments`, `/access`, `/analytics/energy`.


---

## Testing Instructions

- Test framework: **Jest** (via `react-scripts`).
- Run: `npm test -- --watch=false` (CI) or `npm test` (interactive).
- There is **one existing test**: `src/utils/constants.test.js`.
- If you add tests, place them adjacent to the source file (`ComponentName.test.jsx`) so CRA discovers them automatically.

---

## Security Considerations

1. **No active auth guard.** `PrivateRoute` is hard-coded to `true`. Do not expose sensitive debugging interfaces under the assumption they are protected.
2. **Tenant ID in localStorage.** `activeTenantId` is read from `localStorage` and sent as `x-tenant-id`. It is not sensitive, but it is user-tamperable.
3. **Cookies are httpOnly.** The frontend does not handle tokens directly; the Axios client relies on browser cookies.
4. **Environment files are ignored.** `.env`, `.env.production`, `.env.local`, and variants are in `.gitignore`. Do not commit secrets.
5. **Build artifact is plain static files.** The output in `build/` contains minified JS with embedded env values. Treat built artifacts as containing whatever was in the build environment.


---

## Deployment Process

Deployment is fully automated via **GitHub Actions** (`.github/workflows/deploy.yml`).

### CI Pipeline (`validate` job)

1. Triggers on PRs to `main`, pushes to `main`, version tags (`v*.*.*`), or manual dispatch.
2. Detects package manager (npm/pnpm/yarn/bun) from lock files.
3. Validates required environment variables (`REACT_APP_API_URL`, `REACT_APP_ENV`, plus several `VITE_*` vars).
4. Installs dependencies (uses GitHub Packages registry for `@evzone-group-dev` scope).
5. Runs lint (if script exists).
6. Runs tests (if script exists).
7. Runs `npm run build`.
8. Verifies `build/index.html` exists.
9. Creates a gzipped release archive and uploads it as an artifact.

### CD Pipeline (`deploy` job)

1. Downloads the release artifact.
2. SCPs the archive and a `release-id.txt` to a DigitalOcean droplet.
3. SSHs into the droplet and:
   - Extracts the archive into a versioned release directory.
   - Backs up the current `SERVER_ROOT`.
   - Atomically swaps the live directory via a symlink (`ln -sfn`).
   - Sets ownership to `www-data:www-data`.
   - Reloads nginx.

**You do not need to deploy manually.** Pushing to `main` or creating a version tag triggers the full pipeline.


---

## CRACO / Webpack Customization

`craco.config.js` tweaks the CRA webpack config:

- Suppresses source map warnings originating from `node_modules`.
- Excludes `node_modules` from `source-map-loader` to reduce build noise.

If you need additional webpack overrides (e.g., aliases, fallbacks), add them here rather than ejecting.

---

## Useful Scripts & Helpers

- `update_imports.sh` — A bash helper that greps `src/screens` for inline definitions of `MobileShell`, `MapPicker`, `Stat`, and `createTheme` to identify files that may need import refactoring. It is safe to run but does not modify files.

---

## Quick Reference — Entry Points

| Concern | File |
|---------|------|
| App bootstrap | `src/index.js` |
| Root component & providers | `src/App.js` |
| Route table | `src/routes/index.jsx` |
| API instance | `src/services/api/index.js` |
| Theme | `src/utils/theme.js` |
| Layout shell | `src/components/layout/MobileShell.jsx` |
| Feature flags / constants | `src/utils/constants.js` |
| Onboarding state | `src/context/OnboardingContext.jsx` |
| Build config | `craco.config.js` |
| CI/CD | `.github/workflows/deploy.yml` |
