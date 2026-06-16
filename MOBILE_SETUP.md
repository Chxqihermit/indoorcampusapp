# CampusNav React Native App

This folder contains the **React Native (Expo)** mobile client that replaces the old Inertia web UI.

Laravel remains the **API backend** (MySQL via Laragon, staff directory, indoor navigation, WiFi).

## Prerequisites

- Node.js 20+
- Laragon with MySQL running
- Android Studio (emulator) and/or Xcode (iOS simulator)
- Expo Go app (for quick testing) or a dev build

## 1. Backend setup (one time)

From the project root:

```powershell
composer install
php artisan migrate
php artisan db:seed
php artisan serve --host=0.0.0.0 --port=8000
```

Mobile API auth uses built-in bearer tokens (no Sanctum package required).

`--host=0.0.0.0` lets physical devices on your LAN reach the API.

## 2. Mobile setup

```powershell
cd mobile
npm install
```

Create a `.env` file in `mobile/`:

```env
# Android emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000

# iOS simulator
# EXPO_PUBLIC_API_URL=http://127.0.0.1:8000

# Physical phone (use your PC's LAN IP)
# EXPO_PUBLIC_API_URL=http://192.168.1.50:8000
```

Start Expo:

```powershell
npx expo start
```

Press `a` for Android emulator or scan the QR code with Expo Go on your phone.

## 3. Default login

If you ran `php artisan db:seed`:

- Email: `test@example.com`
- Password: `password`

## App features

| Tab | Feature |
|-----|---------|
| **Map** | Campus map, staff/building search, GPS route line to destination |
| **Indoor** | Building/floor picker, indoor pathfinding |
| **WiFi** | WiFi scan + access point list via API |
| **Profile** | Account info, sign out |

Search scopes on the map: **All · Staff · Buildings**

## API endpoints used

- `POST /api/auth/login`, `/api/auth/register`, `/api/auth/logout`
- `GET /api/staff/search?q=`
- `GET /api/campus-buildings/search?q=`
- `GET /api/geojson/{name}`
- `GET /api/buildings`, `/api/floor/{id}/locations`, `/api/path/{start}/{end}`
- `GET /api/scan-wifi-networks`, `/api/floor/{id}/wifi-access-points`

## Web + mobile

This project supports **both**:

- **Web map** — log in and open `/dashboard` (Inertia + Vite)
- **Mobile app** — React Native client in `mobile/` (Expo)

Both use the same Laravel API (`/api/*`).

## Notes

- **WiFi scanning on device** may need a native module (Expo Go has limits). The screen calls your Laravel WiFi API; extend with `react-native-wifi-reborn` for on-device scans if needed.
- **Outdoor routing** on the map is a straight line to destination for now. Full walkway routing can be ported from the web `MapComponent` later.
- Add app icons to `mobile/assets/` (`icon.png`, `splash-icon.png`, `adaptive-icon.png`) before store builds.
