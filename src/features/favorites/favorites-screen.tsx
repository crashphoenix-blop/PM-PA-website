"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Gift } from "@/shared/api/types";
import { GiftCard } from "@/shared/components/gift-card";
import { fetchFavoriteGifts, toggleFavorite } from "@/features/favorites/favorites-service";
import { trackEvent } from "@/shared/analytics/tracker";

export function FavoritesScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const favorites = await fetchFavoriteGifts();
      setItems(favorites);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить избранное");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onToggle = async (giftId: number) => {
    try {
      const nextState = await toggleFavorite(giftId, { surface: "favorites" });
      setItems((prev) =>
        prev
          .map((gift) => (gift.id === giftId ? { ...gift, is_favorite: nextState } : gift))
          .filter((gift) => gift.is_favorite)
      );
    } catch {
      setError("Не удалось обновить избранное");
    }
  };

  return (
    <main className="page">
      <div className="content-width">
        <h1 className="miama page-title">Нравится!</h1>
        {loading ? <p style={{ marginTop: 24 }}>Загрузка...</p> : null}
        {error ? <p style={{ color: "crimson", marginTop: 16 }}>{error}</p> : null}
        {!loading && items.length === 0 ? (
          <p className="miama screen-subtitle" style={{ marginTop: 32, whiteSpace: "pre-line" }}>
            {"Ай!\nВ избранном пока пусто"}
          </p>
        ) : null}

        <section className="gift-grid" style={{ marginTop: 16 }}>
          {items.map((gift) => (
            <div key={gift.id}>
              <GiftCard
                gift={gift}
                onOpen={() => router.push(`/gift/${gift.id}`)}
                onToggleFavorite={() => void onToggle(gift.id)}
              />
              <button
                type="button"
                className="primary-button"
                style={{ width: "100%", marginTop: 8, minHeight: 45, borderRadius: 22.5 }}
                onClick={() => {
                  void trackEvent("purchase_click", { gift_id: gift.id, surface: "favorites" });
                  if (gift.store_url) window.open(gift.store_url, "_blank", "noopener,noreferrer");
                }}
              >
                к продавцу
              </button>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
