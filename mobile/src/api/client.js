import { API_BASE_URL } from "@/constants/config";

async function apiFetch(path, options = {}) {
  const headers = {
    Accept: "application/json",
    ...options.body ? { "Content-Type": "application/json" } : {},
    ...options.headers
  };
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    ...options,
    headers
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.message ?? errorBody.errors?.email?.[0] ?? `Request failed (${response.status})`;
    throw new Error(message);
  }
  return response.json();
}

async function fetchGeoJson(name) {
  return apiFetch(`/geojson/${name}`);
}

export {
  apiFetch,
  fetchGeoJson
};
