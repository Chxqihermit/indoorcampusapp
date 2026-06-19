# CampusNav Mobile Setup

The mobile app is an **Expo shell** that loads the **same web campus map** in a WebView at **`/campus`**. You get full parity with the browser: MapLibre, staff cards, search, routing, GPS, and brand UI — **one codebase**.

> **Capacitor** at the repo root is an alternative WebView shell. Use **`mobile/`** with Expo (recommended), or `npm run cap:android` with `CAPACITOR_SERVER_URL` pointing at `/campus`.

---

## Architecture

```
Expo (React Native)
├── Tab: CampusNav → WebView → http://10.0.2.2:8000/campus
│     └── Laravel + Inertia + MapComponent (MapLibre GL)
│     └── StaffDetailCard (swipeable bottom sheet)
│     └── CampusSearch (no top banner on /campus)
└── Tab: About

Native GPS bridge (WebAppScreen + geoBridge.js)
  expo-location permission → postMessage ↔ expoGeolocation.js patch
```

The old React Native map (`MapScreen.jsx`, `react-native-maps`) is **not used**. It remains in the repo for reference only.

---

## Prerequisites

- Node.js 20+
- Laragon with MySQL running (for staff/building search APIs)
- **Android:** Android Studio emulator or Expo Go on a device
- **iOS:** Mac with Xcode or Expo Go on iPhone

---

## 1. Backend + web assets (project root)

```powershell
composer install
php artisan migrate
php artisan db:seed
npm install
npm run build
php artisan serve --host=0.0.0.0 --port=8000
```

### Why `npm run build` is required

The Android emulator loads JavaScript from Laravel on port **8000**. It **cannot** reach the Vite dev server (usually port **5173**). After **any** change to `resources/js` or `resources/css`, run:

```powershell
npm run build
```

Then reload the app in Expo.

#### npm scripts (project root)

| Script | Hot reload? | Use for |
|--------|-------------|---------|
| **`npm run dev:host`** | **Yes** | **Browser** development — run with `php artisan serve` |
| **`npm run build`** | No | **Mobile WebView**, production |
| **`npm run dev`** | No | Same as `build` in this repo — use the rows above instead |

`npm run dev:host` is for **browser** development only. It does **not** update the Expo app; mobile always needs **`npm run build`**.

### Asset URLs on emulator

`AppServiceProvider` calls `URL::forceRootUrl()` from the incoming request host, so Vite-built assets use `http://10.0.2.2:8000/build/...` in the emulator instead of `127.0.0.1`.

---

## 2. Mobile app

```powershell
cd mobile
npm install
```

Create **`mobile/.env`**:

```env
# Android emulator → host machine
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000
EXPO_PUBLIC_WEB_URL=http://10.0.2.2:8000/campus

# Physical phone (same Wi-Fi — use your PC LAN IP from ipconfig):
# EXPO_PUBLIC_API_URL=http://192.168.1.50:8000
# EXPO_PUBLIC_WEB_URL=http://192.168.1.50:8000/campus
```

Start Expo:

```powershell
$env:EXPO_OFFLINE='1'   # optional — if Expo registry fetch fails
npx expo start
```

- Press **`a`** — Android emulator
- Press **`i`** — iOS simulator (Mac)
- Scan QR with **Expo Go** on a physical phone

**No login required** — `/campus` is a public route.

---

## What you get

| Feature | Implementation |
|---------|----------------|
| MapLibre map, 3D buildings, labels | Web `/campus` |
| Staff search + swipeable detail card | Web `StaffDetailCard.jsx` |
| Category pills hide when card expanded | Web `CampusMapLayout` + `CampusSearch` |
| Walkway routing + live GPS route trim | Web `MapComponent.jsx` |
| Indoor navigation | Web `/campus/indoor` |
| GPS permissions | Native `expo-location` + JS bridge |
| Full-screen map (no NUST header) | Web `/campus` (`hideHeader`) |
| Brand blue (Pantone 281) | `resources/css/app.css` |

### Staff card behaviour (mobile)
- Opens when you search or tap a staff member
- **Swipe** handle up/down — Google Maps–style snap points
- **Directions** — collapses card, sets GPS start, computes route
- Swipe down hard while collapsed — dismisses card
- Tap map — collapses card

---

## GPS / location

WebView `geolocationEnabled` alone is **not enough** on Android. The app uses:

1. **`expo-location`** — requests foreground permission when the WebView loads
2. **`mobile/src/webview/geoBridge.js`** — handles `geo-get` / watch messages from the web app
3. **`resources/js/lib/expoGeolocation.js`** — patches `navigator.geolocation` inside the WebView

### First-time setup
1. Reload the Expo app after `npm run build`
2. Tap **Allow** when Android asks for location
3. On the **emulator**, set a mock location: **Extended controls (⋯) → Location** → pick a point on campus

### Permission denied?
**Settings → Apps → CampusNav → Permissions → Location → Allow**, then reload.

See also [GPS_LOCATION_GUIDE.md](GPS_LOCATION_GUIDE.md).

---

## Capacitor (optional alternative)

From project root `.env`:

```env
CAPACITOR_SERVER_URL=http://10.0.2.2:8000/campus
```

```powershell
npm run build
npm run cap:sync
npm run cap:android
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Blank / white WebView | Run `npm run build`; verify `php artisan serve --host=0.0.0.0`; check `EXPO_PUBLIC_WEB_URL` |
| Stuck on "Loading campus map…" | Build assets not served — run `npm run build`; confirm Laravel is running |
| Network request failed | Same Wi-Fi on phone; use PC LAN IP; `--host=0.0.0.0` on artisan |
| Emulator can't reach API | Use `http://10.0.2.2:8000` (not `localhost`) |
| GPS permission denied | Allow in app settings; reload; use native bridge (requires latest build) |
| GPS works but wrong position | Set mock location in Android emulator extended controls |
| Staff card overlaps search | Collapse card or tap Directions — category pills auto-hide when expanded |
| `expo-asset` missing | `cd mobile && npm install expo-asset@~11.0.5` |
| Expo `fetch failed` / SSL | `$env:NODE_OPTIONS='--use-system-ca'; $env:EXPO_OFFLINE='1'; npx expo start` |
| npm SSL on Windows | `$env:NODE_OPTIONS='--use-system-ca'` before `npm install` |
| Web changes not visible | Run `npm run build` at project root, then reload WebView |

---

## File reference

| Path | Role |
|------|------|
| `mobile/App.jsx` | Campus + About tabs |
| `mobile/src/screens/WebAppScreen.jsx` | WebView + GPS bridge wiring |
| `mobile/src/webview/geoBridge.js` | Native side of geolocation bridge |
| `resources/js/pages/campus.jsx` | Public Inertia page |
| `resources/js/components/CampusMapLayout.jsx` | Shared map layout |
| `resources/js/lib/expoGeolocation.js` | Web side geolocation patch |
| `routes/web.php` | `/campus`, `/campus/indoor` routes |

**Last updated:** June 2026
