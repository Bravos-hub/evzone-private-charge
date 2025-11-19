# Private Charge - EVzone Private Charging Management

A React-based mobile-first application for managing private EV charging stations.

## Features

- 📱 Mobile-first design (420px optimized)
- 🔌 Charger management and configuration
- ⚡ Live charging session monitoring
- 💰 Pricing and fee management
- 📅 Scheduling and availability
- 🔐 Access control and permissions
- 📊 Analytics and reporting
- 💳 Payment and billing integration

## Tech Stack

- **React 18** - UI framework
- **Create React App** - Build tool and development environment
- **Material-UI (MUI)** - Component library
- **React Router** - Routing
- **Axios** - HTTP client
- **Pigeon Maps** - Map integration

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the root directory:
```bash
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_OCPP_SERVER_URL=wss://ocpp.evzone.app
REACT_APP_ENV=development
```

4. Start development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)



## Available Scripts

- `npm start` - Start development server (runs on port 3000)
- `npm run build` - Build for production (outputs to `build/` folder)
- `npm test` - Run tests in interactive watch mode
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run eject` - Eject from Create React App (irreversible)

## Screen Organization

Screens are organized by feature:
- `screens/home/` - Home and dashboard
- `screens/chargers/` - Charger management
- `screens/sessions/` - Charging sessions
- `screens/pricing/` - Pricing configuration
- `screens/access/` - Access control
- `screens/analytics/` - Analytics and reports
- `screens/settings/` - Settings and configuration

## Development Guidelines

1. Follow the existing component patterns
2. Use custom hooks for reusable logic
3. Keep components mobile-first (max-width: 420px)
4. Use the shared `MobileShell` component for consistent layout
5. Follow the EVzone color scheme (#03cd8c green, #f77f00 orange)

## License

Proprietary - EVzone

