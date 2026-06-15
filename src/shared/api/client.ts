import { sessionStorageService } from "@/shared/lib/storage";
import type {
  ApiErrorCode,
  AnalyticsEventPayload,
  AuthResponse,
  Category,
  Gift,
  GiftCandidate,
  GiftCandidateListResponse,
  GiftListResponse,
  IngestionClearResponse,
  IngestionRun,
  ProfileUpdatePayload,
  RefreshTokenResponse,
  User
} from "@/shared/api/types";
import { ApiError } from "@/shared/api/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
export const resolveApiAssetUrl = (pathOrUrl: string | null | undefined): string => {
  if (!pathOrUrl) return "";
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  if (pathOrUrl.startsWith("/")) return new URL(pathOrUrl, API_BASE_URL).toString();
  return pathOrUrl;
};

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
  async getAllGifts(page = 1, perPage = 100) {
    const firstPage = await request<GiftListResponse>({
      path: "/gifts",
      params: { page, per_page: perPage },
      withAuth: false
    });

    const allGifts = [...firstPage.gifts];
    let currentPage = firstPage.page + 1;
    const maxPages = 50; // safety guard against accidental infinite loops

    while (allGifts.length < firstPage.total && currentPage <= maxPages) {
      const nextPage = await request<GiftListResponse>({
        path: "/gifts",
        params: { page: currentPage, per_page: perPage },
        withAuth: false
      });

      if (nextPage.gifts.length === 0) break;
      allGifts.push(...nextPage.gifts);
      currentPage += 1;
    }

    return {
      gifts: allGifts,
      total: allGifts.length,
      page: 1,
      per_page: allGifts.length
    };
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
  async uploadGiftImage(file: File): Promise<{ image_url: string }> {
    const token = sessionStorageService.getToken();
    if (!token) throw new ApiError("Unauthorized", "UNAUTHORIZED", 401);
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(buildUrl("/gifts/upload-image"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const payload = (await response.json()) as { detail?: string };
        if (payload.detail) detail = payload.detail;
      } catch {
        // keep fallback
      }
      throw toApiError(response.status, detail);
    }
    return (await response.json()) as { image_url: string };
  },
  trackAnalyticsEvent(payload: AnalyticsEventPayload) {
    return request<{ ok: boolean }>({
      path: "/analytics/events",
      method: "POST",
      body: payload
    });
  },
  runGiftIngestion(triggeredBy = "admin") {
    return request<IngestionRun>({
      path: "/admin/ingestion/run",
      method: "POST",
      body: { triggered_by: triggeredBy }
    });
  },
  getIngestionRuns(limit = 5) {
    return request<IngestionRun[]>({
      path: "/admin/ingestion/runs",
      params: { limit }
    });
  },
  clearIngestionResults() {
    return request<IngestionClearResponse>({
      path: "/admin/ingestion/results",
      method: "DELETE"
    });
  },
  getIngestionCandidates(status?: string, page = 1, perPage = 50) {
    return request<GiftCandidateListResponse>({
      path: "/admin/ingestion/candidates",
      params: { status, page, per_page: perPage }
    });
  },
  getIngestionCandidate(id: number) {
    return request<GiftCandidate>({
      path: `/admin/ingestion/candidates/${id}`
    });
  },
  approveGiftCandidate(
    id: number,
    payload: {
      category_ids?: number[];
      category_names?: string[];
      name?: string;
      description?: string;
      price?: number;
    }
  ) {
    return request<GiftCandidate>({
      path: `/admin/ingestion/candidates/${id}/approve`,
      method: "POST",
      body: payload
    });
  },
  rejectGiftCandidate(id: number) {
    return request<GiftCandidate>({
      path: `/admin/ingestion/candidates/${id}/reject`,
      method: "POST"
    });
  },
  getAIRecommendations(payload: {
    recipient: string;
    occasion: string;
    budget: string;
    style: string;
    is_urgent: boolean;
    age_group: string;
    interests: string;
  }) {
    return request<{ gifts: Gift[]; budget_expanded: boolean }>({
      path: "/ai/recommend",
      method: "POST",
      body: payload,
      withAuth: false
    });
  }
};
