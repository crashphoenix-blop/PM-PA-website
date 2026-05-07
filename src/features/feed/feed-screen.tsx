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

const HIDDEN_CATEGORY_NAMES = new Set(["14 февраля", "23 февраля"]);

export function FeedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [state, setState] = useState<FeedState>({ gifts: [], allGifts: [], categories: [] });
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applyFilters = (
    allGifts: Gift[],
    categories: Category[],
    selectedCategoryIndex: number,
    query: string
  ): Gift[] => {
    const normalizedQuery = query.trim().toLowerCase();
    const visibleCategories = categories.filter((item) => !HIDDEN_CATEGORY_NAMES.has(item.name.trim().toLowerCase()));
    const category = selectedCategoryIndex > 0 ? visibleCategories[selectedCategoryIndex - 1] : null;

    return allGifts.filter((gift) => {
      const categoryMatched = !category || gift.categories.some((entry) => entry.id === category.id);
      if (!categoryMatched) return false;

      if (!normalizedQuery) return true;
      const title = gift.name.toLowerCase();
      const description = (gift.description ?? "").toLowerCase();
      return title.includes(normalizedQuery) || description.includes(normalizedQuery);
    });
  };

  const visibleCategories = useMemo(
    () => state.categories.filter((item) => !HIDDEN_CATEGORY_NAMES.has(item.name.trim().toLowerCase())),
    [state.categories]
  );
  const categoryTitles = useMemo(() => ["все", ...visibleCategories.map((item) => item.name)], [visibleCategories]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        await syncFavoritesFromServer();
        const [categories, recommended, all] = await Promise.all([
          apiClient.getCategories(),
          apiClient.getRecommendedGifts(),
          apiClient.getAllGifts()
        ]);
        const allGifts = all.gifts.length > 0 ? all.gifts : recommended.gifts;
        if (!active) return;
        setState({
          gifts: allGifts,
          allGifts,
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

  const onSelectCategory = (index: number) => {
    const nextQuery = searchQuery;
    setSelectedCategory(index);
    setError(null);
    setState((prev) => ({
      ...prev,
      gifts: applyFilters(prev.allGifts, prev.categories, index, nextQuery)
    }));
  };

  const onSearch = (query: string) => {
    setSearchQuery(query);
    setState((prev) => ({
      ...prev,
      gifts: applyFilters(prev.allGifts, prev.categories, selectedCategory, query)
    }));
  };

  const onToggleFavorite = async (giftId: number) => {
    try {
      const isFavorite = await toggleFavorite(giftId, { surface: "feed" });
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
