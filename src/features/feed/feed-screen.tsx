"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/shared/api/client";
import type { Category, Gift } from "@/shared/api/types";
import { GiftCard } from "@/shared/components/gift-card";
import { toggleFavorite, syncFavoritesFromServer } from "@/features/favorites/favorites-service";
import { useAuth } from "@/features/auth/auth-context";

type FeedState = {
  gifts: Gift[];
  allGifts: Gift[];
  categories: Category[];
};

export function FeedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [state, setState] = useState<FeedState>({ gifts: [], allGifts: [], categories: [] });
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const categoryTitles = useMemo(() => ["все", ...state.categories.map((item) => item.name)], [state.categories]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        await syncFavoritesFromServer();
        const [categories, recommended] = await Promise.all([
          apiClient.getCategories(),
          apiClient.getRecommendedGifts()
        ]);
        if (!active) return;
        setState({
          gifts: recommended.gifts,
          allGifts: recommended.gifts,
          categories
        });
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить подарки");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const onSelectCategory = async (index: number) => {
    setSelectedCategory(index);
    setSearchQuery("");
    setError(null);

    if (index === 0) {
      setState((prev) => ({ ...prev, gifts: prev.allGifts }));
      return;
    }

    const category = state.categories[index - 1];
    if (!category) return;
    try {
      const filtered = await apiClient.getGiftsByCategory(category.id);
      setState((prev) => ({ ...prev, gifts: filtered.gifts }));
    } catch {
      setState((prev) => ({
        ...prev,
        gifts: prev.allGifts.filter((gift) => gift.categories.some((entry) => entry.id === category.id))
      }));
    }
  };

  const onSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query) {
      onSelectCategory(selectedCategory);
      return;
    }
    try {
      const results = await apiClient.searchGifts(query);
      setState((prev) => ({ ...prev, gifts: results.gifts }));
    } catch {
      setState((prev) => ({
        ...prev,
        gifts: prev.allGifts.filter(
          (gift) =>
            gift.name.toLowerCase().includes(query.toLowerCase()) ||
            (gift.description ?? "").toLowerCase().includes(query.toLowerCase())
        )
      }));
    }
  };

  const onToggleFavorite = async (giftId: number) => {
    try {
      const isFavorite = await toggleFavorite(giftId);
      setState((prev) => ({
        ...prev,
        gifts: prev.gifts.map((gift) => (gift.id === giftId ? { ...gift, is_favorite: isFavorite } : gift)),
        allGifts: prev.allGifts.map((gift) => (gift.id === giftId ? { ...gift, is_favorite: isFavorite } : gift))
      }));
    } catch {
      setError("Не удалось обновить избранное");
    }
  };

  const greetingsName = user?.name ?? "Гость";

  return (
    <main className="page">
      <div className="content-width">
        <h1 style={{ margin: "0 0 6px", fontSize: 28, color: "var(--app-primary)" }}>
          Привет, <span className="miama">{greetingsName}</span>
        </h1>

        <input
          className="search-input"
          value={searchQuery}
          onChange={(event) => void onSearch(event.target.value)}
          placeholder="что я хочу..."
          aria-label="Поиск подарков"
        />

        <div className="category-row">
          {categoryTitles.map((title, index) => (
            <button
              key={`${title}-${index}`}
              type="button"
              className="category-chip"
              style={{ background: selectedCategory === index ? "var(--app-primary)" : "var(--app-secondary)" }}
              onClick={() => void onSelectCategory(index)}
            >
              {title}
            </button>
          ))}
        </div>

        {loading ? <p style={{ marginTop: 24 }}>Загрузка...</p> : null}
        {error ? <p style={{ color: "crimson", marginTop: 16 }}>{error}</p> : null}
        {!loading && state.gifts.length === 0 ? <p style={{ marginTop: 24 }}>Подарков пока нет</p> : null}

        <section className="gift-grid" style={{ marginTop: 12 }}>
          {state.gifts.map((gift) => (
            <GiftCard
              key={gift.id}
              gift={gift}
              onOpen={() => router.push(`/gift/${gift.id}`)}
              onToggleFavorite={() => void onToggleFavorite(gift.id)}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
