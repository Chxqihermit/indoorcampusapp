# CampusNav Mobile (native Android & iOS)

The official mobile apps are **native** — built with **Expo / React Native** in `mobile/`. They are **not** a Chrome/Safari WebView.

The web dashboard (`resources/js/`) and the mobile app share the **same Laravel API** and campus data, but mobile uses native maps, native GPS, and native UI.

> **Note:** The repo also has an optional Capacitor WebView wrapper at the project root. That is a separate, website-in-a-shell approach. Use **`mobile/`** for a true native app.

---

## Prerequisites

- Node.js 20+
- Laragon with MySQL running
- **Android:** Android Studio (emulator) or Expo Go on a device
- **iOS:** Mac with Xcode or Expo Go on iPhone

---

## 1. Backend

From the project root:

```powershell
composer install
php artisan migrate
php artisan db:seed
php artisan serve --host=0.0.0.0 --port=8000
```

`--host=0.0.0.0` lets phones and emulators reach the API.

---

## 2. Mobile app

```powershell
cd mobile
npm install
```

Create `mobile/.env`:

```env
# Android emulator → host machine
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000

# Physical phone (same Wi-Fi, your PC IP from ipconfig):
# EXPO_PUBLIC_API_URL=http://192.168.1.50:8000

# iOS simulator on Mac:
# EXPO_PUBLIC_API_URL=http://127.0.0.1:8000
```

Start Expo:

```powershell
npx expo start
```

- Press **`a`** — Android emulator  
- Press **`i`** — iOS simulator (Mac)  
- Or scan QR with **Expo Go** on your phone  

### Default login

- Email: `test@example.com`  
- Password: `password`  

---

## Native features (parity with web)

| Feature | Status |
|---------|--------|
| Staff / building search (All · Staff · Buildings) | ✓ |
| Walkway routing (not straight line) | ✓ |
| GPS route line shortens as you walk | ✓ |
| Indoor path API | ✓ |
| Indoor floor plan SVG (web has full viewer) | List + text route (floor plan UI planned) |
| MapLibre 3D buildings | Uses `react-native-maps` instead |
| Fortify web settings / 2FA | Web only |

---

## Publishing to stores (Expo EAS)

Expo does **not** block Play Store or App Store publishing:

```powershell
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
eas build --platform ios
```

Configure `app.json` icons in `mobile/assets/` before release builds.

Production API URL: set `EXPO_PUBLIC_API_URL` to your hosted Laravel server at build time.

---

## API endpoints

Same as web — see root `README.md`. Mobile uses `/api/auth/*` with bearer tokens.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Network request failed | Check `EXPO_PUBLIC_API_URL`; restart Expo after `.env` changes |
| Emulator can't reach API | Use `http://10.0.2.2:8000` |
| Phone can't reach API | Use PC LAN IP; `php artisan serve --host=0.0.0.0`; check firewall |
| No walkway route | Ensure `public/data/nust-walkways.geojson` exists; destination near paths |

---

## Optional: Capacitor WebView (not recommended for native UX)

If you ever want the **website** inside a WebView instead, see `capacitor.config.ts` and run `npm run cap:android` from the project root. That is **not** this native app.
