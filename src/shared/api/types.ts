export type ApiErrorCode = "UNAUTHORIZED" | "NETWORK" | "SERVER" | "UNKNOWN";

export class ApiError extends Error {
  code: ApiErrorCode;
  status?: number;

  constructor(message: string, code: ApiErrorCode, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export type User = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  is_guest: boolean;
  is_admin: boolean;
  created_at: string | null;
  avatar_url: string | null;
};

export type AuthResponse = {
  user: User;
  token: string;
  refresh_token: string | null;
};

export type RefreshTokenResponse = {
  token: string;
  refresh_token: string | null;
};

export type Category = {
  id: number;
  name: string;
};

export type GiftImage = {
  url: string;
  sort_order: number;
  is_primary: boolean;
};

export type Gift = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string;
  store_name: string | null;
  store_url: string | null;
  created_at: string;
  categories: Category[];
  images: GiftImage[];
  is_favorite: boolean;
};

export type GiftListResponse = {
  gifts: Gift[];
  total: number;
  page: number;
  per_page: number;
};

export type ProfileUpdatePayload = {
  name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
};

export type IngestionRun = {
  id: number;
  status: string;
  triggered_by: string;
  started_at: string;
  finished_at: string | null;
  found_count: number;
  new_count: number;
  duplicate_count: number;
  error_count: number;
  error_message: string | null;
};

export type GiftCandidate = {
  id: number;
  source_id: number;
  run_id: number;
  dedup_key: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string;
  store_name: string;
  store_url: string;
  status: string;
  duplicate_reason: string | null;
  published_gift_id: number | null;
  created_at: string;
  reviewed_at: string | null;
  source_key: string | null;
  source_name: string | null;
};

export type GiftCandidateListResponse = {
  candidates: GiftCandidate[];
  total: number;
};

export type IngestionClearResponse = {
  deleted_candidates: number;
  deleted_runs: number;
};

export type AnalyticsEventPayload = {
  event_name: string;
  event_time?: string;
  anonymous_id?: string;
  session_id?: string;
  user_id?: number;
  gift_id?: number;
  surface?: string;
  action?: string;
  path?: string;
  duration_seconds?: number;
  payload?: Record<string, unknown>;
};
