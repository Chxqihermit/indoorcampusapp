import Constants from 'expo-constants';

/**
 * API base URL for Laravel backend.
 * - Android emulator: http://10.0.2.2:8000
 * - iOS simulator: http://127.0.0.1:8000
 * - Physical device: http://YOUR_LAN_IP:8000
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  'http://10.0.2.2:8000';

export const CAMPUS_CENTER = {
  latitude: -22.5655,
  longitude: 17.0755,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};
