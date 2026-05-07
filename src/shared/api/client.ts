import { sessionStorageService } from "@/shared/lib/storage";
import type {
  ApiErrorCode,
  AnalyticsEventPayload,
  AuthResponse,
  Category,
  Gift,
  GiftListResponse,
  ProfileUpdatePayload,
  RefreshTokenResponse,
  User
} from "@/shared/api/types";
import { ApiError } from "@/shared/api/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

const buildUrl = (path: string, params?: Record<string, string | number | undefined>): string => {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && `${value}` !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
};

let refreshPromise: Promise<boolean> | null = null;

const toApiError = (status: number, message?: string): ApiError => {
  const code: ApiErrorCode =
    status === 401 ? "UNAUTHORIZED" : status >= 500 ? "SERVER" : status > 0 ? "NETWORK" : "UNKNOWN";
  return new ApiError(message ?? `HTTP ${status}`, code, status);
};

const rawRequest = async <TResponse>({
  path,
  method = "GET",
  body,
  params,
  withAuth = true
}: {
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Record<string, unknown>;
  params?: Record<string, string | number | undefined>;
  withAuth?: boolean;
}): Promise<TResponse> => {
  const token = withAuth ? sessionStorageService.getToken() : null;
  const response = await fetch(buildUrl(path, params), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const payload = (await response.json()) as { detail?: string };
      if (payload.detail) detail = payload.detail;
    } catch {
      // keep default detail
    }
    throw toApiError(response.status, detail);
  }

  return (await response.json()) as TResponse;
};

const canRefresh = (path: string): boolean =>
  !path.startsWith("/auth/login") && !path.startsWith("/auth/register") && !path.startsWith("/auth/refresh");

const refreshTokens = async (): Promise<boolean> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = sessionStorageService.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await rawRequest<RefreshTokenResponse>({
        path: "/auth/refresh",
        method: "POST",
        withAuth: false,
        body: { refresh_token: refreshToken }
      });
      sessionStorageService.setToken(response.token);
      sessionStorageService.setRefreshToken(response.refresh_token);
      return true;
    } catch {
      return false;
    }
  })();

  const result = await refreshPromise;
  refreshPromise = null;
  return result;
};

const request = async <TResponse>({
  path,
  method = "GET",
  body,
  params,
  withAuth = true
}: {
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Record<string, unknown>;
  params?: Record<string, string | number | undefined>;
  withAuth?: boolean;
}): Promise<TResponse> => {
  try {
    return await rawRequest<TResponse>({ path, method, body, params, withAuth });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && canRefresh(path) && withAuth) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        return rawRequest<TResponse>({ path, method, body, params, withAuth });
      }
      sessionStorageService.clearSession();
    }
    throw error;
  }
};

export const apiClient = {
  register(payload: { email?: string; phone?: string; name: string; password: string }) {
    return request<AuthResponse>({
      path: "/auth/register",
      method: "POST",
      body: payload,
      withAuth: false
    });
  },
  login(payload: { email_or_phone: string; password: string }) {
    return request<AuthResponse>({
      path: "/auth/login",
      method: "POST",
      body: payload,
      withAuth: false
    });
  },
  getMe() {
    return request<User>({ path: "/users/me" });
  },
  updateMe(payload: ProfileUpdatePayload) {
    return request<User>({
      path: "/users/me",
      method: "PUT",
      body: payload
    });
  },
  getCategories() {
    return request<Category[]>({ path: "/categories", withAuth: false });
  },
  getRecommendedGifts(page = 1, perPage = 50) {
    return request<GiftListResponse>({
      path: "/gifts/recommended",
      params: { page, per_page: perPage },
      withAuth: true
    });
  },
  getAllGifts(page = 1, perPage = 500) {
    return request<GiftListResponse>({
      path: "/gifts",
      params: { page, per_page: perPage },
      withAuth: false
    });
  },
  getGiftsByCategory(categoryId: number, page = 1, perPage = 200) {
    return request<GiftListResponse>({
      path: "/gifts",
      params: { category_id: categoryId, page, per_page: perPage }
    });
  },
  searchGifts(query: string, page = 1, perPage = 200) {
    return request<GiftListResponse>({
      path: "/gifts/search",
      params: { q: query, page, per_page: perPage }
    });
  },
  getGiftDetails(id: number) {
    return request<Gift>({ path: `/gifts/${id}` });
  },
  getFavorites() {
    return request<Gift[]>({ path: "/favorites" });
  },
  toggleFavorite(id: number) {
    return request<Gift>({
      path: `/favorites/${id}/toggle`,
      method: "POST"
    });
  },
  createGift(payload: {
    name: string;
    description?: string;
    price: number;
    image_url: string;
    store_name?: string;
    store_url?: string;
    category_ids?: number[];
    category_names?: string[];
  }) {
    return request<Gift>({
      path: "/gifts",
      method: "POST",
      body: payload
    });
  },
  trackAnalyticsEvent(payload: AnalyticsEventPayload) {
    return request<{ ok: boolean }>({
      path: "/analytics/events",
      method: "POST",
      body: payload
    });
  }
};
