import { createContext, useContext, useMemo, useState } from "react";
import { api, clearSession, getStoredToken, getStoredUser, storeSession } from "../api/client";
import { User } from "../types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(getStoredToken);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      async login(email, password) {
        const result = await api.login({ email, password });
        storeSession(result.token, result.user);
        setUser(result.user);
        setToken(result.token);
      },
      async register(name, email, password) {
        const result = await api.register({ name, email, password });
        storeSession(result.token, result.user);
        setUser(result.user);
        setToken(result.token);
      },
      logout() {
        clearSession();
        setUser(null);
        setToken(null);
      },
    }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
