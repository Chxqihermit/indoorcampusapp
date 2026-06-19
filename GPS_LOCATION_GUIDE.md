# GPS Location Setup Guide

## Overview

CampusNav uses your device location for the blue user dot, setting your start point, and **live route trimming** as you walk. This guide covers web, mobile WebView (Expo), and Capacitor.

---

## How to use GPS

### Web dashboard (`/dashboard`)

| Method | Action |
|--------|--------|
| **`*` key** | Use current GPS location as start (ignored while typing in an input) |
| **Directions panel** | "Use my current location" in directions mode |
| **Map GPS control** | Floating GPS button on the map (hidden `[data-gps-btn]`) |
| **Staff card → Directions** | Sets GPS start and routes to the staff member (mobile: collapses card first) |

### Public campus map (`/campus`) — mobile WebView

Same controls as the web app. GPS goes through the **native Expo bridge** (`expo-location`), not browser geolocation alone.

1. Allow location when Android/iOS prompts
2. Tap **Directions** on a staff card, or use directions mode / `*` on a physical keyboard
3. Emulator: set mock location in **Extended controls → Location**

---

## Connection requirements

### Web browser
- **HTTPS**, or
- **`localhost` / `127.0.0.1`**, or
- **LAN IP** (e.g. `http://192.168.x.x:8000`), or
- **Capacitor native** shell

The app treats **`10.0.2.2`** (Android emulator host) and **`expo-webview`** as allowed contexts.

### Mobile (Expo)
- Foreground location permission via **expo-location**
- No separate browser permission — managed at the **app** level
- If denied: **Settings → Apps → CampusNav → Location → Allow**

---

## Troubleshooting

### "Permission denied" — web browser

1. Click the **lock icon** in the address bar
2. Set **Location** to **Allow**
3. Refresh and try again

Browsers: Chrome, Firefox, Safari, Edge (latest).

### "Permission denied" — Expo / mobile app

1. **Settings → Apps → CampusNav → Permissions → Location → Allow**
2. Reload the Expo app (press `r` in terminal or reload in emulator)
3. Ensure you ran **`npm run build`** after recent web changes
4. On emulator, set a location under **Extended controls → Location**

Error text in the app: *"Allow location access for CampusNav in your device settings."*

### "Location unavailable"

1. Enable **Location/GPS** in device settings
2. Move near a window or outdoors
3. Emulator: set coordinates manually in extended controls
4. Wait 30–60 seconds for a GPS lock

### "Request timed out"

1. Retry in an open area
2. Emulator: confirm mock location is set
3. Default timeout is 30 seconds

### Route trimming not working

Live trim only runs when:
- A route is displayed (start + destination set)
- GPS permission is granted
- Position updates are arriving (`watchPosition`)

---

## Android emulator tips

1. **`npm run build`** at project root — required for WebView to load JS
2. **`php artisan serve --host=0.0.0.0 --port=8000`**
3. **`EXPO_PUBLIC_WEB_URL=http://10.0.2.2:8000/campus`**
4. **Extended controls (⋯) → Location** — pick a point on NUST campus
5. Allow location for the Expo/CampusNav app when prompted

---

## Keyboard shortcuts (web)

| Key | Action |
|-----|--------|
| `*` | Use current GPS location |
| `Shift` + `↑` / `↓` | Pitch map |
| `Shift` + `←` / `→` | Rotate map |

---

## Privacy

- GPS data is used **on your device** for map display and routing
- Location is **not stored** on the server by the map component
- Revoke permission anytime in browser or app settings

---

## Technical details

| Context | Mechanism |
|---------|-----------|
| Web browser | `navigator.geolocation` |
| Capacitor native | `@capacitor/geolocation` + `initializeCapacitor()` |
| Expo WebView | `expo-location` bridge — `mobile/src/webview/geoBridge.js` patches via `resources/js/lib/expoGeolocation.js` |

See [MOBILE_SETUP.md](MOBILE_SETUP.md) for mobile setup.

---

**Last updated:** June 2026
