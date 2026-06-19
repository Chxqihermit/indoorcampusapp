# CampusNav — Campus Wayfinding & Navigation

**CampusNav** is a campus navigation platform for **NUST (Namibia University of Science and Technology)**. It provides outdoor walking routes on an interactive MapLibre map, staff and building search, Google Maps–style staff detail cards, and indoor floor navigation — backed by **Laravel 12** + **MySQL** (Laragon).

| Surface | URL / entry | Auth |
|---------|-------------|------|
| **Web dashboard** | `/dashboard` | Login required (Fortify) |
| **Public campus map** | `/campus` | No login — used by mobile WebView |
| **Indoor navigation** | `/indoor-map` or `/campus/indoor` | Public on `/campus/indoor` |
| **Mobile (Expo)** | WebView → `/campus` | No login |

---

## Key features

### Outdoor map
- **MapLibre GL** — 3D buildings, satellite/vector styles, campus GeoJSON layers, bold building labels
- **A\* pathfinding** on walkway graph (`nust-walkways.geojson`) with building avoidance
- **Live GPS** — continuous position tracking, blue user dot, route line trims as you walk
- **Campus search** — staff, buildings, and POIs with **All | Staff | Buildings** scope filters
- **Quick category pills** — Buildings, Restaurants, Parking, ATMs, Hostels (hidden while staff card is expanded on mobile)
- **Directions mode** — set start/end, swap points, use GPS as start
- **Staff detail card** — Google Maps–style bottom sheet on mobile (swipe up/down, peek bar at bottom)
- **GPS** — press `*` for current location (ignored while typing in an input); staff **Directions** button sets your location and collapses the card
- **Keyboard shortcuts** — `Shift` + arrow keys for pitch/bearing; right-click resets view

### Mobile (Expo — recommended)
- **Expo shell** in `mobile/` loads the **same web UI** at `/campus` in a WebView — one codebase for map, search, routing, and staff cards
- **Native GPS bridge** — `expo-location` permissions + JavaScript bridge (WebView geolocation alone is unreliable on Android)
- Two tabs: **CampusNav** (map) and **About**
- No separate React Native map to maintain

### Optional Capacitor shell
- Root-level **Capacitor** wrapper (`android/`, `ios/`) can load `/campus` in a WebView — alternative to Expo

### Indoor navigation
- Floor plans, room search, and path highlighting
- Laravel-seeded indoor locations and graph data

### API & data
- Staff directory search (`staffdirectory` table)
- Campus building search (`campusbuilding` table)
- Indoor location search and routing
- WiFi positioning endpoints

---

## Architecture

| Layer | Technology |
|-------|------------|
| **Web UI** | React 19 + JSX, Inertia.js, MapLibre GL, Tailwind CSS |
| **Mobile** | Expo 52 + `react-native-webview` → `/campus` (same React app) |
| **Optional native shell** | Capacitor 8 (`android/`, `ios/`) |
| **Backend** | Laravel 12, Fortify auth |
| **Database** | MySQL (Laragon) — e.g. `nustcampusdatabase` |
| **Build** | Vite 7 |

### Project structure

```
indoorcampusapp/
├── mobile/                      # Expo app (WebView shell + GPS bridge)
│   ├── src/screens/WebAppScreen.jsx
│   └── src/webview/geoBridge.js
├── android/, ios/               # Optional Capacitor WebView
├── app/                         # Laravel controllers, models, providers
├── public/data/                 # GeoJSON (campus, buildings, walkways, labels)
├── resources/
│   ├── js/
│   │   ├── app.jsx              # Inertia entry (+ expo geolocation init)
│   │   ├── components/
│   │   │   ├── MapComponent.jsx
│   │   │   ├── CampusMapLayout.jsx   # Shared layout (dashboard + /campus)
│   │   │   ├── CampusSearch.jsx
│   │   │   ├── StaffDetailCard.jsx   # Swipeable bottom sheet on mobile
│   │   │   └── MapHeader.jsx         # Hidden on /campus (full-screen map)
│   │   ├── pages/
│   │   │   ├── dashboard.jsx
│   │   │   └── campus.jsx            # Public map (no sidebar/header)
│   │   └── lib/
│   │       ├── capacitor.js
│   │       └── expoGeolocation.js    # Patches navigator.geolocation in WebView
│   └── css/app.css              # Brand blue Pantone 281 (#1B2C5D)
├── routes/web.php               # /campus, /campus/indoor, /dashboard
└── routes/api.php               # Staff, buildings, indoor, WiFi APIs
```

> Wayfinder regenerates `.ts` route helpers under `resources/js/actions` and `resources/js/routes` on each build. Hand-written UI is **JSX**.

---

## Installation

### Prerequisites
- PHP 8.2+
- Node.js 20+
- Composer
- Laragon (MySQL) or compatible MySQL server
- **Mobile:** Android Studio emulator and/or Expo Go

### Backend

```powershell
composer install
cp .env.example .env   # configure DB_*
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve --host=0.0.0.0 --port=8000
```

Example `.env` database settings (Laragon):

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nustcampusdatabase
DB_USERNAME=root
DB_PASSWORD=
```

Staff records live in the MySQL `staffdirectory` table (not Laravel seeders).

### Web frontend

```powershell
npm install
```

#### Which npm script to use

| Command | What it does | Hot reload? | When to use |
|---------|----------------|-------------|-------------|
| **`npm run dev:host`** | Starts the Vite **dev server** (`vite --host`) | **Yes** — changes apply as you save | Daily **browser** development on `/dashboard` or `/campus` |
| **`npm run build`** | One-off **production build** into `public/build/` | No | **Mobile WebView**, production, or when not running the Vite dev server |
| **`npm run dev`** | Same as `build` in this project (`vite build`) | No | Prefer **`dev:host`** (web) or **`build`** (mobile) instead |

**Browser development (hot reload):**

```powershell
# Terminal 1
php artisan serve

# Terminal 2
npm run dev:host
```

Laravel serves pages on port **8000**; Vite serves JS/CSS with HMR (usually port **5173**). Keep both running.

**Production / mobile (no dev server):**

```powershell
npm run build
php artisan serve --host=0.0.0.0 --port=8000
```

The Expo app and Android emulator load built files from Laravel — they **cannot** use `dev:host`. After any change to `resources/js` or `resources/css`, run **`npm run build`** again and reload the mobile app.

- **Dashboard:** http://127.0.0.1:8000/dashboard
- **Public campus map:** http://127.0.0.1:8000/campus

Optional map styling:

```env
VITE_MAPTILER_KEY=your-key
VITE_MAPTILER_STYLE=hybrid
```

### Mobile (Expo)

See **[MOBILE_SETUP.md](MOBILE_SETUP.md)** for the full guide.

```powershell
# Terminal 1 — project root
npm run build
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2
cd mobile
npm install
npx expo start
```

`mobile/.env` (Android emulator):

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000
EXPO_PUBLIC_WEB_URL=http://10.0.2.2:8000/campus
```

---

## Usage

### Finding a route

1. Search for a staff member, building, or POI — or open **Directions** from the search bar.
2. Set a **start** (search, map click, or `*` / GPS for current location).
3. Set a **destination** (building) or search a **staff member** (opens staff card).
4. The blue route line appears with distance and estimated time.
5. **Walk the route** — GPS shortens the line behind you and updates remaining distance/time.

### Staff card (mobile)
- Search or tap a staff marker → card slides up from the bottom
- **Swipe** the handle to expand or collapse to the peek bar
- **Directions** → collapses the card, uses GPS as start, routes to the staff member
- Category pills (Buildings, Parking, …) hide while the card is expanded

### Search scopes
- **All** — staff, database buildings, known POIs, indoor locations
- **Staff** — staff directory only
- **Buildings** — campus buildings, POIs, indoor locations

### Keyboard & map (web)

| Action | Shortcut |
|--------|----------|
| GPS / my location | `*` |
| Increase pitch | `Shift` + `↑` |
| Decrease pitch | `Shift` + `↓` |
| Rotate left | `Shift` + `←` |
| Rotate right | `Shift` + `→` |
| Reset view | Right-click |

---

## API endpoints (selection)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/staff/search?q=` | Staff directory search |
| GET | `/api/campus-buildings/search?q=` | Building search |
| GET | `/api/locations/search?q=` | Indoor location search |

Full routes: `routes/api.php`.

---

## GeoJSON data (`public/data/`)

| File | Purpose |
|------|---------|
| `nust-campus.geojson` | Campus boundary |
| `nust-walkways.geojson` | Walkable paths for A\* graph |
| `nust-buildings.geojson` | Building footprints (3D + edge pruning) |
| `nust-labels.geojson` | Labels and local geocoding |
| `nust-lower-campus.geojson` | Lower campus outline |
| `eng-rooms.geojson` | Engineering room data |

---

## Development commands

```powershell
php artisan serve --host=0.0.0.0 --port=8000
npm run dev:host           # Browser only — hot reload (use with php artisan serve)
npm run build              # Compile assets to public/build/ — required for mobile
npm run lint
npm run format
php artisan migrate
php artisan db:seed
npm run mobile:install
npm run mobile             # Start Expo from project root
npm run cap:sync           # Optional Capacitor sync
```

> **`npm run dev`** runs the same as **`npm run build`** in this repo (no hot reload). Use **`dev:host`** for web editing or **`build`** for mobile/production.

**After changing web code for mobile:** run `npm run build` and reload the Expo app — the emulator cannot reach the Vite dev server.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| **Map blank** | Check browser console; ensure map container has height; try without `VITE_MAPTILER_KEY` |
| **Mobile stuck on splash** | Run `npm run build`; keep `php artisan serve --host=0.0.0.0` running; check `EXPO_PUBLIC_WEB_URL` |
| **Mobile assets 404 / wrong host** | `AppServiceProvider` forces asset URLs from the request host (`10.0.2.2` in emulator) |
| **No route found** | Ensure `public/data/nust-walkways.geojson` exists; start/end near walkways |
| **GPS permission denied (mobile)** | Allow location for CampusNav in device settings; reload app; set mock location in Android emulator (Extended controls → Location) |
| **GPS on web** | HTTPS, `localhost`, or LAN IP; allow browser location permission — see [GPS_LOCATION_GUIDE.md](GPS_LOCATION_GUIDE.md) |
| **Staff search empty** | MySQL running; rows in `staffdirectory`; test `/api/staff/search?q=test` |

---

## Related docs

| Doc | Contents |
|-----|----------|
| [MOBILE_SETUP.md](MOBILE_SETUP.md) | Expo, WebView, env vars, GPS bridge, troubleshooting |
| [mobile/README.md](mobile/README.md) | Short mobile overview |
| [GPS_LOCATION_GUIDE.md](GPS_LOCATION_GUIDE.md) | GPS usage and permission help |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Deep dive into map/pathfinding (partially dated) |

---

## License

MIT License — see LICENSE.

**Last updated:** June 2026
