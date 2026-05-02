"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/shared/api/client";
import type { User } from "@/shared/api/types";
import { sessionStorageService } from "@/shared/lib/storage";

type AuthContextValue = {
  user: User | null;
  isGuest: boolean;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  register: (payload: { name: string; emailOrPhone: string; password: string }) => Promise<void>;
  startGuest: () => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateLocalUser: (nextUser: User) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const parsePersistedUser = (): User | null => {
  const persisted = sessionStorageService.getUser();
  if (!persisted) return null;
  return {
    ...persisted,
    is_admin: Boolean(persisted.is_admin),
    is_guest: sessionStorageService.isGuest(),
    created_at: null
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initialUser = parsePersistedUser();
    if (initialUser) {
      setUser(initialUser);
    } else if (sessionStorageService.isGuest()) {
      setUser({
        id: -1,
        name: "Гость",
        email: null,
        phone: null,
        avatar_url: null,
        is_guest: true,
        is_admin: false,
        created_at: null
      });
    }
    setIsReady(true);
  }, []);

  const isGuest = Boolean(user?.is_guest);
  const isAuthenticated = Boolean(sessionStorageService.getToken() && !isGuest);

  const persistUser = (nextUser: User | null, guest: boolean) => {
    sessionStorageService.setGuest(guest);
    if (nextUser) {
      sessionStorageService.setUser({
        id: nextUser.id,
        name: nextUser.name,
        email: nextUser.email,
        phone: nextUser.phone,
        avatar_url: nextUser.avatar_url,
        is_admin: nextUser.is_admin
      });
    } else {
      sessionStorageService.setUser(null);
    }
    setUser(nextUser);
  };

  const login = async (emailOrPhone: string, password: string) => {
    const response = await apiClient.login({ email_or_phone: emailOrPhone, password });
    sessionStorageService.setToken(response.token);
    sessionStorageService.setRefreshToken(response.refresh_token);
    persistUser(response.user, false);
  };

  const register = async ({
    name,
    emailOrPhone,
    password
  }: {
    name: string;
    emailOrPhone: string;
    password: string;
  }) => {
    const payload = emailOrPhone.includes("@")
      ? { name, email: emailOrPhone, password }
      : { name, phone: emailOrPhone, password };
    const response = await apiClient.register(payload);
    sessionStorageService.setToken(response.token);
    sessionStorageService.setRefreshToken(response.refresh_token);
    persistUser(response.user, false);
  };

  const startGuest = () => {
    sessionStorageService.clearSession();
    sessionStorageService.setGuest(true);
    persistUser(
      {
        id: -1,
        name: "Гость",
        email: null,
        phone: null,
        avatar_url: null,
        is_guest: true,
        is_admin: false,
        created_at: null
      },
      true
    );
  };

  const logout = () => {
    sessionStorageService.clearSession();
    persistUser(null, false);
  };

  const refreshProfile = async () => {
    if (!sessionStorageService.getToken()) return;
    const fresh = await apiClient.getMe();
    persistUser(fresh, false);
  };

  const value: AuthContextValue = {
    user,
    isGuest,
    isAuthenticated,
    isReady,
    login,
    register,
    startGuest,
    logout,
    refreshProfile,
    updateLocalUser: (nextUser) => persistUser(nextUser, Boolean(nextUser.is_guest))
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
