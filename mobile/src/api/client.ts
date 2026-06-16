import { API_BASE_URL } from '@/constants/config';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message =
      (errorBody as { message?: string }).message ??
      (errorBody as { errors?: Record<string, string[]> }).errors?.email?.[0] ??
      `Request failed (${response.status})`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function fetchGeoJson(name: string) {
  return apiFetch<{ features?: Array<{ properties?: Record<string, unknown>; geometry?: { type?: string; coordinates?: number[] } }> }>(`/geojson/${name}`);
}
