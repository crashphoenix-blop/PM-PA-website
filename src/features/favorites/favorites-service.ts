import { apiClient } from "@/shared/api/client";
import type { Gift } from "@/shared/api/types";
import { ApiError } from "@/shared/api/types";
import { trackEvent } from "@/shared/analytics/tracker";
import { sessionStorageService } from "@/shared/lib/storage";

export const syncFavoritesFromServer = async (): Promise<Set<number>> => {
  const token = sessionStorageService.getToken();
  if (!token) return sessionStorageService.getFavoriteIds();
  const favorites = await apiClient.getFavorites();
  const ids = new Set<number>(favorites.map((item) => item.id));
  sessionStorageService.setFavoriteIds(ids);
  return ids;
};

export const toggleFavorite = async (
  giftId: number,
  context: { surface?: string } = {}
): Promise<boolean> => {
  const token = sessionStorageService.getToken();
  if (!token) {
    const ids = sessionStorageService.getFavoriteIds();
    if (ids.has(giftId)) ids.delete(giftId);
    else ids.add(giftId);
    sessionStorageService.setFavoriteIds(ids);
    const isFavorite = ids.has(giftId);
    void trackEvent("favorite_click", {
      gift_id: giftId,
      action: isFavorite ? "add" : "remove",
      surface: context.surface ?? "unknown"
    });
    return isFavorite;
  }

  const response = await apiClient.toggleFavorite(giftId);
  const ids = sessionStorageService.getFavoriteIds();
  if (response.is_favorite) ids.add(giftId);
  else ids.delete(giftId);
  sessionStorageService.setFavoriteIds(ids);
  void trackEvent("favorite_click", {
    gift_id: giftId,
    action: response.is_favorite ? "add" : "remove",
    surface: context.surface ?? "unknown"
  });
  return response.is_favorite;
};

export const fetchFavoriteGifts = async (): Promise<Gift[]> => {
  const token = sessionStorageService.getToken();
  if (!token) {
    const favoriteIds = sessionStorageService.getFavoriteIds();
    if (favoriteIds.size === 0) return [];
    const all = await apiClient.getAllGifts();
    return all.gifts
      .filter((item) => favoriteIds.has(item.id))
      .map((item) => ({ ...item, is_favorite: true }));
  }
  try {
    return await apiClient.getFavorites();
  } catch (error) {
    if (error instanceof ApiError && error.code === "UNAUTHORIZED") return [];
    throw error;
  }
};
