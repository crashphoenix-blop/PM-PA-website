import { apiClient } from "@/shared/api/client";
import type { Gift } from "@/shared/api/types";
import { ApiError } from "@/shared/api/types";
import { sessionStorageService } from "@/shared/lib/storage";

export const syncFavoritesFromServer = async (): Promise<Set<number>> => {
  const token = sessionStorageService.getToken();
  if (!token) return sessionStorageService.getFavoriteIds();
  const favorites = await apiClient.getFavorites();
  const ids = new Set<number>(favorites.map((item) => item.id));
  sessionStorageService.setFavoriteIds(ids);
  return ids;
};

export const toggleFavorite = async (giftId: number): Promise<boolean> => {
  const token = sessionStorageService.getToken();
  if (!token) {
    const ids = sessionStorageService.getFavoriteIds();
    if (ids.has(giftId)) ids.delete(giftId);
    else ids.add(giftId);
    sessionStorageService.setFavoriteIds(ids);
    return ids.has(giftId);
  }

  const response = await apiClient.toggleFavorite(giftId);
  const ids = sessionStorageService.getFavoriteIds();
  if (response.is_favorite) ids.add(giftId);
  else ids.delete(giftId);
  sessionStorageService.setFavoriteIds(ids);
  return response.is_favorite;
};

export const fetchFavoriteGifts = async (): Promise<Gift[]> => {
  const token = sessionStorageService.getToken();
  if (!token) return [];
  try {
    return await apiClient.getFavorites();
  } catch (error) {
    if (error instanceof ApiError && error.code === "UNAUTHORIZED") return [];
    throw error;
  }
};
