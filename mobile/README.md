# CampusNav Mobile

**Expo app** that loads the **full web campus experience** in a WebView — same MapLibre map, search, swipeable staff cards, and routing as the browser. **No duplicate React Native map.**

## Architecture

```
Expo (native shell)
  └── WebView → EXPO_PUBLIC_WEB_URL (/campus)
        └── Laravel + Inertia + MapComponent (maplibre-gl)
  └── expo-location → GPS bridge → navigator.geolocation patch
```

Tabs: **CampusNav** (map, header hidden for full screen) · **About**

## Quick start

Full details: **[MOBILE_SETUP.md](../MOBILE_SETUP.md)**

```powershell
# Terminal 1 — project root
npm run build
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2
cd mobile
npm install
npx expo start
```

Press **`a`** for Android emulator or scan QR with Expo Go.

### Web scripts (project root)

| Script | Hot reload? | Use for |
|--------|-------------|---------|
| `npm run dev:host` | Yes | Browser dev — run with `php artisan serve` |
| `npm run build` | No | **Expo WebView** — run after every web code change |
| `npm run dev` | No | Same as `build` in this repo |

For mobile, always use **`npm run build`**, then reload the app. The emulator cannot use **`dev:host`**.

## Environment (`mobile/.env`)

| Variable | Android emulator example | Purpose |
|----------|--------------------------|---------|
| `EXPO_PUBLIC_API_URL` | `http://10.0.2.2:8000` | Laravel API (About screen) |
| `EXPO_PUBLIC_WEB_URL` | `http://10.0.2.2:8000/campus` | WebView entry URL |

Physical phone: replace `10.0.2.2` with your PC's LAN IP (`ipconfig`).

## GPS

Location uses a **native bridge** (`src/webview/geoBridge.js` + web `expoGeolocation.js`), not WebView geolocation alone.

1. Allow location when prompted
2. Android emulator: **Extended controls → Location** → set a campus point

## Capacitor alternative

The repo also has Capacitor at the project root. Set `CAPACITOR_SERVER_URL=http://10.0.2.2:8000/campus` for the same UI without Expo.

## Legacy code

`src/screens/MapScreen.jsx` and other native map screens are **unused** — the entry point is `WebAppScreen.jsx` only.

**Last updated:** June 2026
