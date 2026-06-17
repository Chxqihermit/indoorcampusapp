import Constants from "expo-constants";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? Constants.expoConfig?.extra?.apiUrl ?? "http://10.0.2.2:8000";
const CAMPUS_CENTER = {
  latitude: -22.5655,
  longitude: 17.0755,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012
};
export {
  API_BASE_URL,
  CAMPUS_CENTER
};
