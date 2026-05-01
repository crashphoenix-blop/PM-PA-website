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
