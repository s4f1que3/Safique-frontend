"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI } from "@/lib/api";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const data = await authAPI.signIn(email, password);
    const accessToken = data?.session?.access_token;
    const refreshToken = data?.session?.refresh_token;
    const userData = data?.user;
    if (!accessToken) throw new Error("Sign in failed");
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
    setToken(accessToken);
    setUser(userData);
  };

  const signOut = async () => {
    await authAPI.signOut().catch(() => {});
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refresh_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
