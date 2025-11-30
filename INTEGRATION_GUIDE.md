# Frontend-Backend Integration Guide

## Overview

The EVzone Private Charge frontend is now fully configured to communicate with the Node.js/Express backend API.

## Configuration Summary

### Backend API URL
The frontend is configured to connect to:
```
http://localhost:8000/api
```

This is set in `.env`:
```
REACT_APP_API_URL=http://localhost:8000/api
```

### Authentication Flow
1. User registers or logs in via `/` or `/register`
2. Backend returns JWT token
3. Token is stored in `localStorage` and used in all API requests
4. `AuthContext` manages auth state globally
5. `PrivateRoute` component protects authenticated routes

## Key Integration Points

### 1. Authentication (AuthContext)
**File:** `src/context/AuthContext.jsx`

Provides:
- `useAuth()` hook for accessing auth state
- `register()` — Register new user
- `login()` — Login user
- `logout()` — Clear auth
- `refreshToken()` — Refresh JWT token
- `isAuthenticated` — Boolean flag

**Usage in Components:**
```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/" />;
  
  return <div>Welcome {user.firstName}</div>;
}
```

### 2. Site Management (SiteContext)
**File:** `src/context/SiteContext.jsx`

Provides:
- `useSite()` hook for site operations
- `fetchSites()` — List user sites
- `createSite()` — Create new site
- `updateSite()` — Edit site
- `deleteSite()` — Remove site
- `selectSite()` — Set active site
- `currentSite` — Currently selected site

**Usage:**
```jsx
import { useSite } from '../context/SiteContext';

function SitesList() {
  const { sites, fetchSites, currentSite, selectSite } = useSite();
  
  useEffect(() => {
    fetchSites();
  }, []);
  
  return sites.map(site => (
    <Button key={site.id} onClick={() => selectSite(site)}>
      {site.name}
    </Button>
  ));
}
```

### 3. API Service Modules
Located in `src/services/api/`:

#### `auth.js` — Authentication
```javascript
import { authApi } from '../services/api/auth';

authApi.login({ email, password })
authApi.register({ email, password, firstName, lastName })
authApi.refresh()
```

#### `chargers.js` — Charger Management
```javascript
import { chargerApi } from '../services/api/chargers';

chargerApi.getAll(params)          // List chargers
chargerApi.getById(id)              // Get details
chargerApi.getStatus(id)            // Get live status
chargerApi.create(data)             // Create charger
chargerApi.update(id, data)         // Update charger
chargerApi.delete(id)               // Delete charger
```

#### `sessions.js` — Charging Sessions
```javascript
import { sessionApi } from '../services/api/sessions';

sessionApi.getAll(params)           // List sessions
sessionApi.getById(id)              // Get session details
sessionApi.start(data)              // Start session (POST to /sessions/start)
sessionApi.stop(id, data)           // Stop session
```

#### `sites.js` — Site Management
```javascript
import { sitesApi } from '../services/api/sites';

sitesApi.getAll(params)
sitesApi.getById(id)
sitesApi.create(data)
sitesApi.update(id, data)
sitesApi.delete(id)
```

#### `users.js` — User Profile
```javascript
import { usersApi } from '../services/api/users';

usersApi.getProfile()               // Get current user
usersApi.updateProfile(data)        // Update profile
```

#### `pricing.js` — Pricing & Tariffs
```javascript
import { pricingApi } from '../services/api/pricing';

pricingApi.getPlans(params)
pricingApi.createPlan(data)
pricingApi.importTariffs(data)      // Import TOU from CSV/API
```

#### `access.js` — Access Control
```javascript
import { accessApi } from '../services/api/access';

accessApi.getPermissions(params)
accessApi.grantPermission(data)
accessApi.validateGuestPass(id, data)
```

### 4. Custom Hooks

#### `useChargers()` — Charger Operations
**File:** `src/hooks/useChargers.js`

```javascript
import { useChargers } from '../hooks/useChargers';

const { 
  chargers, 
  loading, 
  error, 
  fetchChargers, 
  createCharger, 
  updateCharger, 
  deleteCharger 
} = useChargers();

// Example usage
useEffect(() => {
  fetchChargers({ siteId: currentSite.id });
}, [currentSite]);
```

#### `useSessions()` — Session Operations
**File:** `src/hooks/useSessions.js`

```javascript
import { useSessions } from '../hooks/useSessions';

const { 
  sessions, 
  loading, 
  startSession, 
  stopSession 
} = useSessions();
```

## Testing the Integration

### 1. Start the Backend
```bash
cd /home/bravos/Desktop/private-charge-backend
docker-compose up -d
docker exec evzone-backend npm run migrate
docker exec evzone-backend npm run seed
```

### 2. Start the Frontend
```bash
cd /home/bravos/Desktop/private-charge
npm install
npm start
```

### 3. Test Login
- Navigate to `http://localhost:3000`
- Use test credentials:
  - Email: `admin@evzone.com`
  - Password: `password123`
- Should redirect to `/dashboard`

### 4. Test API Calls
Open browser DevTools → Network tab and monitor requests as you:
- Create a new site
- Add a charger
- View charger status
- Start/stop a session

All requests should include `Authorization: Bearer <token>` header.

## Error Handling

All API calls include error handling:

```javascript
try {
  const result = await chargerApi.create(data);
  if (result.success) {
    // Handle success
  } else {
    // result.error contains message
  }
} catch (error) {
  // Handle error
}
```

## Token Management

- **Storage:** `localStorage` with keys `authToken` and `user`
- **Expiration:** Set to 7 days (configurable in backend `.env`)
- **Refresh:** Call `useAuth().refreshToken()` to get new token
- **Auto-Logout:** If token expires and refresh fails, user is logged out

## CORS Configuration

Frontend can only call backend at:
```
http://localhost:8000
```

Configured in backend `docker-compose.yml`:
```
CORS_ORIGIN=http://localhost:3000
```

Change if frontend runs on different port.

## Next Steps

1. **Update Existing Screens** — Replace mock data with API calls in:
   - `screens/chargers/MyChargers.jsx`
   - `screens/sessions/ChargingHistory.jsx`
   - `screens/pricing/PricingFees.jsx`
   - etc.

2. **Add More API Services** — Create modules for:
   - Bookings
   - Payments/Invoices
   - Analytics
   - Diagnostics

3. **Add Loading States** — Wrap components with loading indicators

4. **Add Error Boundaries** — Catch and display API errors gracefully

5. **Implement WebSocket** — For live charger status via OCPP (future)

## Troubleshooting

### "Unauthorized" or 401 errors
- Check JWT token is in `localStorage`
- Verify backend JWT_SECRET matches
- Try logging out and back in

### CORS errors
- Confirm backend is running on port 8000
- Check `CORS_ORIGIN` in backend `.env`
- Verify frontend URL matches

### API returns "endpoint not found"
- Check `REACT_APP_API_URL` in frontend `.env`
- Verify backend routes are implemented
- Check API service module URL paths

### Blank pages after login
- Check browser console for errors
- Verify `AuthContext` and `SiteContext` are wrapping the app
- Confirm `PrivateRoute` is properly checking `isAuthenticated`

---

For more details, see:
- Backend README: `/backend/README.md`
- Frontend routes: `src/routes/index.jsx`
