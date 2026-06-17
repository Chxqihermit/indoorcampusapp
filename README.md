# CampusNav - Campus Wayfinding & Navigation System

## Overview

**CampusNav** is a campus navigation platform for **NUST (Namibia University of Science and Technology)**. It provides outdoor walking routes on an interactive map, staff and building search, and indoor floor navigation — backed by **Laravel 12** + **MySQL** (Laragon).

- **Web** — full dashboard at `/dashboard` (React + Inertia + MapLibre)
- **Mobile** — **native** Android/iOS app in `mobile/` (Expo / React Native), not a WebView

---

## Key Features

### Outdoor map (web dashboard)
- **MapLibre GL** map with 3D buildings, satellite/vector styles, and campus GeoJSON layers
- **A\* pathfinding** on walkway graph (`nust-walkways.geojson`) with building avoidance
- **Live route trimming** — once a route is active, GPS tracking shortens the blue line as you walk toward the destination and updates remaining distance/time
- **Campus search** — search staff, buildings, and POIs with **All | Staff | Buildings** filters
- **Directions mode** — set start/end, swap points, use GPS as start
- **GPS hotkey** — press `*` to use current location (ignored while typing in an input)
- **Keyboard shortcuts** — `Shift` + arrow keys for pitch/bearing; right-click resets view

### API & data
- Staff directory search (`staffdirectory` table)
- Campus building search (`campusbuilding` table)
- Indoor location search and routing
- WiFi positioning endpoints
- Bearer-token API auth for mobile (no Sanctum package required)

### Mobile (native Android & iOS)
- **Expo / React Native** in `mobile/` — true native app (maps, GPS, tabs)
- Walkway routing + live route trimming (same logic as web, native implementation)
- Staff/building search, indoor nav, WiFi screens
- Store-ready via **EAS Build**
- See [MOBILE_SETUP.md](MOBILE_SETUP.md)

> An optional **Capacitor** WebView wrapper exists at the repo root if you ever want the website in a shell — but **`mobile/`** is the recommended native app.

### Indoor navigation
- Floor plans, room search, and path highlighting on `/indoor-map`
- Laravel-seeded indoor locations and graph data

---

## Architecture

| Layer | Technology |
|-------|------------|
| **Web UI** | React 19 + JSX, Inertia.js, MapLibre GL |
| **Mobile** | Expo / React Native (`mobile/`) — native, not WebView |
| **Optional** | Capacitor WebView wrapper (`android/`, `ios/`) |
| **Map** | MapLibre GL |
| **Backend** | Laravel 12, Fortify auth |
| **Database** | MySQL (Laragon) — `nustcampusdatabase` |
| **Build** | Vite |

### Project structure

```
indoorcampusapp/
├── mobile/                 # Native Expo app (official mobile)
├── android/                # Optional Capacitor WebView (Android)
├── ios/                    # Optional Capacitor WebView (iOS)
├── app/                    # Laravel models, controllers, middleware
├── public/data/            # GeoJSON (campus, buildings, walkways, labels)
├── resources/
│   ├── js/
│   │   ├── app.jsx         # Inertia entry
│   │   ├── components/     # MapComponent, CampusSearch, MapHeader, …
│   │   ├── pages/          # dashboard, IndoorNavigation, auth, settings
│   │   ├── utils/          # campusSearch.js, pathfinding, …
│   │   ├── actions/        # Wayfinder-generated route helpers (.ts)
│   │   └── routes/         # Wayfinder-generated route helpers (.ts)
│   └── css/app.css
├── routes/api.php          # Staff, buildings, indoor, WiFi, auth APIs
└── database/seeders/       # Users, buildings, indoor locations
```

> **Note:** Wayfinder regenerates small `.ts` helper files under `resources/js/actions` and `resources/js/routes` on each build. All hand-written UI code is **JSX**.

---

## Installation

### Prerequisites
- PHP 8.2+
- Node.js 18+
- Composer
- Laragon (MySQL) or compatible MySQL server

### Backend

```powershell
composer install
cp .env.example .env   # configure DB_* for MySQL
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
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
npm run build        # production
# or
npm run dev:host     # Vite dev server with HMR
```

Open **http://127.0.0.1:8000/dashboard** (log in after seeding — default user from `UserSeeder`).

Optional map styling:

```env
VITE_MAPTILER_KEY=your-key
VITE_MAPTILER_STYLE=hybrid
```

### Mobile (native)

```powershell
cd mobile
npm install
npx expo start
```

Backend: `php artisan serve --host=0.0.0.0 --port=8000`  
Set `EXPO_PUBLIC_API_URL` in `mobile/.env` (see [MOBILE_SETUP.md](MOBILE_SETUP.md)).

---

## Usage

### Finding a route on the dashboard

1. Search for a staff member, building, or POI — or open **Directions** from the search bar.
2. Set a **start** (map click, search, or `*` / GPS button for current location).
3. Set a **destination**.
4. The blue route line appears with distance and estimated time.
5. **Walk the route** — with location permission granted, the line **shortens behind you** as GPS updates and the popup shows **remaining** distance/time. Tracking stops when you arrive (~15 m from destination) or clear the route.

### Search scopes
- **All** — staff, database buildings, known POIs, indoor locations
- **Staff** — staff directory only
- **Buildings** — campus buildings, POIs, indoor locations

### Keyboard & map
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
| POST | `/api/login` | Mobile login (returns bearer token) |
| POST | `/api/register` | Mobile registration |

Full routes are defined in `routes/api.php`.

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
php artisan serve          # Laravel (port 8000)
npm run dev:host           # Vite dev server
npm run build              # Production asset build
npm run lint               # ESLint
npm run format             # Prettier
php artisan migrate        # Run migrations
php artisan db:seed        # Seed users, buildings, indoor data
npm run mobile:install     # Install mobile/ dependencies
npm run mobile             # Start Expo dev server
npm run cap:sync           # Optional Capacitor WebView sync
```

---

## Troubleshooting

**Map blank** — Check browser console for WebGL/tile errors; ensure the map container has height; try without `VITE_MAPTILER_KEY` (falls back to free styles).

**No route found** — Ensure `public/data/nust-walkways.geojson` exists; place start/end on or near walkways.

**GPS / route trimming not working** — Geolocation requires HTTPS, `localhost`, or the Capacitor native app; allow location permission; route trimming only runs while a route is displayed.

**Staff search empty** — Confirm MySQL is running, `staffdirectory` has rows, and `/api/staff/search?q=test` returns JSON.

**API 404** — Ensure `routes/api.php` is registered in `bootstrap/app.php`.

---

## License

MIT License — see LICENSE.

---

**Last updated:** June 2026
