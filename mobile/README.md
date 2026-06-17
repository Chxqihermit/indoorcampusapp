# CampusNav Mobile (native)

**Official Android & iOS app** — built with **Expo / React Native** (not a WebView).

This is a true native application using `react-native-maps`, native GPS, and native navigation. It shares the **Laravel API** with the web dashboard but renders with native UI components.

Source code is **JavaScript / JSX** (`jsconfig.json` for `@/` imports).

## Features

| Feature | Native implementation |
|---------|----------------------|
| Campus map | `react-native-maps` |
| Staff / building search | Same APIs as web (`/api/staff/search`, etc.) |
| Walkway routing | Client-side graph on `nust-walkways` GeoJSON (Dijkstra) |
| Live route trimming | `expo-location` GPS watch — line shortens as you walk |
| Indoor navigation | Building/floor picker + `/api/path` |
| Auth | Bearer token + SecureStore |

## Quick start

See **[MOBILE_SETUP.md](../MOBILE_SETUP.md)** in the project root.

```powershell
cd mobile
npm install
npx expo start
```

## Not the same as Capacitor

The repo also contains an optional **Capacitor** WebView wrapper at the project root (`android/`, `ios/`). That loads the website in a browser shell. **This folder is the native app** you want for a real mobile experience and store publishing via **EAS Build**.
