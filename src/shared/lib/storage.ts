const KEYS = {
  token: "surprise_auth_token",
  refreshToken: "surprise_auth_refresh_token",
  user: "surprise_auth_user",
  isGuest: "surprise_is_guest",
  favorites: "surprise_favorite_ids",
  onboardingCompleted: "surprise_onboarding_completed"
} as const;

type PersistedUser = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_admin: boolean;
};

const canUseStorage = (): boolean => typeof window !== "undefined";

export const sessionStorageService = {
  getToken(): string | null {
    if (!canUseStorage()) return null;
    return window.localStorage.getItem(KEYS.token);
  },
  setToken(token: string | null): void {
    if (!canUseStorage()) return;
    if (token) window.localStorage.setItem(KEYS.token, token);
    else window.localStorage.removeItem(KEYS.token);
  },
  getRefreshToken(): string | null {
    if (!canUseStorage()) return null;
    return window.localStorage.getItem(KEYS.refreshToken);
  },
  setRefreshToken(token: string | null): void {
    if (!canUseStorage()) return;
    if (token) window.localStorage.setItem(KEYS.refreshToken, token);
    else window.localStorage.removeItem(KEYS.refreshToken);
  },
  getUser(): PersistedUser | null {
    if (!canUseStorage()) return null;
    const raw = window.localStorage.getItem(KEYS.user);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PersistedUser;
    } catch {
      return null;
    }
  },
  setUser(user: PersistedUser | null): void {
    if (!canUseStorage()) return;
    if (user) window.localStorage.setItem(KEYS.user, JSON.stringify(user));
    else window.localStorage.removeItem(KEYS.user);
  },
  isGuest(): boolean {
    if (!canUseStorage()) return false;
    return window.localStorage.getItem(KEYS.isGuest) === "1";
  },
  setGuest(isGuest: boolean): void {
    if (!canUseStorage()) return;
    window.localStorage.setItem(KEYS.isGuest, isGuest ? "1" : "0");
  },
  getFavoriteIds(): Set<number> {
    if (!canUseStorage()) return new Set<number>();
    const raw = window.localStorage.getItem(KEYS.favorites);
    if (!raw) return new Set<number>();
    try {
      const ids = JSON.parse(raw) as number[];
      return new Set<number>(ids);
    } catch {
      return new Set<number>();
    }
  },
  setFavoriteIds(ids: Set<number>): void {
    if (!canUseStorage()) return;
    window.localStorage.setItem(KEYS.favorites, JSON.stringify([...ids]));
  },
  isOnboardingCompleted(): boolean {
    if (!canUseStorage()) return false;
    return window.localStorage.getItem(KEYS.onboardingCompleted) === "1";
  },
  setOnboardingCompleted(value: boolean): void {
    if (!canUseStorage()) return;
    window.localStorage.setItem(KEYS.onboardingCompleted, value ? "1" : "0");
  },
  clearSession(): void {
    if (!canUseStorage()) return;
    window.localStorage.removeItem(KEYS.token);
    window.localStorage.removeItem(KEYS.refreshToken);
    window.localStorage.removeItem(KEYS.user);
    window.localStorage.setItem(KEYS.isGuest, "0");
  }
};
