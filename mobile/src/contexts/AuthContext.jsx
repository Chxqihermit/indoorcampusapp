import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearAuth, loadStoredAuth, login as apiLogin, logout as apiLogout, register as apiRegister } from "@/api/auth";
const AuthContext = createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadStoredAuth().then((stored) => {
      if (stored) setUser(stored.user);
    }).finally(() => setLoading(false));
  }, []);
  const value = useMemo(
    () => ({
      user,
      loading,
      async login(email, password) {
        const { user: nextUser } = await apiLogin(email, password);
        setUser(nextUser);
      },
      async register(name, email, password, passwordConfirmation) {
        const { user: nextUser } = await apiRegister(name, email, password, passwordConfirmation);
        setUser(nextUser);
      },
      async logout() {
        await apiLogout().catch(() => clearAuth());
        setUser(null);
      }
    }),
    [user, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
export {
  AuthProvider,
  useAuth
};
