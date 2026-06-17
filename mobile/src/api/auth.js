import * as SecureStore from "expo-secure-store";
import { apiFetch, setAuthToken } from "@/api/client";
const TOKEN_KEY = "campusnav_token";
const USER_KEY = "campusnav_user";
async function loadStoredAuth() {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const userJson = await SecureStore.getItemAsync(USER_KEY);
  if (!token || !userJson) return null;
  const user = JSON.parse(userJson);
  setAuthToken(token);
  return { token, user };
}
async function login(email, password) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  await persistAuth(data.token, data.user);
  return data;
}
async function register(name, email, password, passwordConfirmation) {
  const data = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation
    })
  });
  await persistAuth(data.token, data.user);
  return data;
}
async function logout() {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } finally {
    await clearAuth();
  }
}
async function persistAuth(token, user) {
  setAuthToken(token);
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}
async function clearAuth() {
  setAuthToken(null);
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}
export {
  clearAuth,
  loadStoredAuth,
  login,
  logout,
  register
};
