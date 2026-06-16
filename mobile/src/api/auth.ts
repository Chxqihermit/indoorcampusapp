import * as SecureStore from 'expo-secure-store';
import { apiFetch, setAuthToken } from '@/api/client';
import type { User } from '@/types';

const TOKEN_KEY = 'campusnav_token';
const USER_KEY = 'campusnav_user';

export async function loadStoredAuth(): Promise<{ token: string; user: User } | null> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const userJson = await SecureStore.getItemAsync(USER_KEY);
  if (!token || !userJson) return null;
  const user = JSON.parse(userJson) as User;
  setAuthToken(token);
  return { token, user };
}

export async function login(email: string, password: string) {
  const data = await apiFetch<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  await persistAuth(data.token, data.user);
  return data;
}

export async function register(name: string, email: string, password: string, passwordConfirmation: string) {
  const data = await apiFetch<{ token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    }),
  });
  await persistAuth(data.token, data.user);
  return data;
}

export async function logout() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } finally {
    await clearAuth();
  }
}

async function persistAuth(token: string, user: User) {
  setAuthToken(token);
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function clearAuth() {
  setAuthToken(null);
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}
