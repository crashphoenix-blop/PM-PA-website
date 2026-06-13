"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
const URGENT_MAX_PRICE = 10000;
const URGENT_LABEL = "Срочные";
const PRICE_FILTER_LABEL = "Цена";
const PRICE_FILTER_LABEL_ACTIVE = "Цена";

export function FeedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [state, setState] = useState<FeedState>({ gifts: [], allGifts: [], categories: [] });
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Price filter
  const [priceOpen, setPriceOpen] = useState(false);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(50000);
  const [sliderMin, setSliderMin] = useState(0);
  const [sliderMax, setSliderMax] = useState(50000);
  const maxPriceRef = useRef(50000);

  const isPriceFiltered = priceMin > 0 || priceMax < maxPriceRef.current;

  const applyFilters = (
    allGifts: Gift[],
    categories: Category[],
    selectedCategoryIndex: number,
    query: string,
    urgent: boolean,
    minPrice: number,
    maxPrice: number
  ): Gift[] => {
    const normalizedQuery = query.trim().toLowerCase();
    const visibleCategories = categories.filter((item) => !HIDDEN_CATEGORY_NAMES.has(item.name.trim().toLowerCase()));
    const category = selectedCategoryIndex > 0 ? visibleCategories[selectedCategoryIndex - 1] : null;

    return allGifts.filter((gift) => {
      if (urgent && gift.price > URGENT_MAX_PRICE) return false;
      const categoryMatched = !category || gift.categories.some((entry) => entry.id === category.id);
      if (!categoryMatched) return false;
      if (gift.price < minPrice || gift.price > maxPrice) return false;
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

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await syncFavoritesFromServer();
      const [categories, recommended, all] = await Promise.all([
        apiClient.getCategories(),
        apiClient.getRecommendedGifts(),
        apiClient.getAllGifts()
      ]);
      const allGifts = all.gifts.length > 0 ? all.gifts : recommended.gifts;

      // Compute max price from data
      const computedMax = Math.max(...allGifts.map((g) => g.price), 50000);
      const roundedMax = Math.ceil(computedMax / 1000) * 1000;
      maxPriceRef.current = roundedMax;
      setPriceMax(roundedMax);
      setSliderMax(roundedMax);

      setState({
        gifts: allGifts,
        allGifts,
        categories
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить подарки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refilter = (
    overrides: Partial<{
      categoryIndex: number;
      query: string;
      urgent: boolean;
      minPrice: number;
      maxPrice: number;
    }>
  ) => {
    setState((prev) => ({
      ...prev,
      gifts: applyFilters(
        prev.allGifts,
        prev.categories,
        overrides.categoryIndex ?? selectedCategory,
        overrides.query ?? searchQuery,
        overrides.urgent ?? urgentOnly,
        overrides.minPrice ?? priceMin,
        overrides.maxPrice ?? priceMax
      )
    }));
  };

  const onSelectCategory = (index: number) => {
    setSelectedCategory(index);
    setError(null);
    refilter({ categoryIndex: index });
  };

  const onToggleUrgent = () => {
    const next = !urgentOnly;
    setUrgentOnly(next);
    setSelectedCategory(0);
    refilter({ urgent: next, categoryIndex: 0 });
  };

  const onSearch = (query: string) => {
    setSearchQuery(query);
    refilter({ query });
  };

  const onTogglePriceFilter = () => {
    if (priceOpen && isPriceFiltered) {
      // Close and reset price filter
      setPriceMin(0);
      setPriceMax(maxPriceRef.current);
      setSliderMin(0);
      setSliderMax(maxPriceRef.current);
      refilter({ minPrice: 0, maxPrice: maxPriceRef.current });
    }
    setPriceOpen((prev) => !prev);
  };

  const onSliderMinChange = (val: number) => {
    const clamped = Math.min(val, sliderMax - 1);
    setSliderMin(clamped);
    setPriceMin(clamped);
    refilter({ minPrice: clamped });
  };

  const onSliderMaxChange = (val: number) => {
    const clamped = Math.max(val, sliderMin + 1);
    setSliderMax(clamped);
    setPriceMax(clamped);
    refilter({ maxPrice: clamped });
  };

  const onInputMin = (raw: string) => {
    const val = Math.max(0, Math.min(Number(raw) || 0, priceMax - 1));
    setPriceMin(val);
    setSliderMin(val);
    refilter({ minPrice: val });
  };

  const onInputMax = (raw: string) => {
    const val = Math.min(maxPriceRef.current, Math.max(Number(raw) || maxPriceRef.current, priceMin + 1));
    setPriceMax(val);
    setSliderMax(val);
    refilter({ maxPrice: val });
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
  const maxVal = maxPriceRef.current || 50000;
  const minPct = (sliderMin / maxVal) * 100;
  const maxPct = (sliderMax / maxVal) * 100;

  return (
    <main className="page">
      <div className="content-width">
        <h1 className="page-title" style={{ margin: "0 0 6px" }}>
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
          {/* Срочные — виртуальная категория */}
          <button
            type="button"
            className="category-chip"
            style={{ background: urgentOnly ? "var(--app-primary)" : "var(--app-secondary)" }}
            onClick={onToggleUrgent}
          >
            {URGENT_LABEL}
          </button>

          {/* Обычные категории */}
          {categoryTitles.map((title, index) => (
            <button
              key={`${title}-${index}`}
              type="button"
              className="category-chip"
              style={{ background: !urgentOnly && selectedCategory === index ? "var(--app-primary)" : "var(--app-secondary)" }}
              onClick={() => {
                if (urgentOnly) setUrgentOnly(false);
                void onSelectCategory(index);
              }}
            >
              {title}
            </button>
          ))}

          {/* Фильтр по цене */}
          <button
            type="button"
            className="category-chip"
            style={{ background: (priceOpen || isPriceFiltered) ? "var(--app-primary)" : "var(--app-secondary)" }}
            onClick={onTogglePriceFilter}
          >
            {priceOpen && isPriceFiltered ? PRICE_FILTER_LABEL_ACTIVE : PRICE_FILTER_LABEL}
          </button>
        </div>

        {/* Панель фильтра по цене */}
        {priceOpen ? (
          <div className="price-filter-panel">
            <div className="price-inputs-row">
              <div className="price-input-wrap">
                <span className="price-input-label">от</span>
                <input
                  type="number"
                  className="price-input"
                  value={priceMin}
                  min={0}
                  max={priceMax - 1}
                  onChange={(e) => onInputMin(e.target.value)}
                />
                <span className="price-input-currency">₽</span>
              </div>
              <div className="price-input-separator" />
              <div className="price-input-wrap">
                <span className="price-input-label">до</span>
                <input
                  type="number"
                  className="price-input"
                  value={priceMax}
                  min={priceMin + 1}
                  max={maxVal}
                  onChange={(e) => onInputMax(e.target.value)}
                />
                <span className="price-input-currency">₽</span>
              </div>
            </div>

            {/* Dual range slider */}
            <div className="price-slider-wrap">
              <div
                className="price-slider-track"
                style={{
                  background: `linear-gradient(to right,
                    var(--app-surface-soft) ${minPct}%,
                    var(--app-primary) ${minPct}%,
                    var(--app-primary) ${maxPct}%,
                    var(--app-surface-soft) ${maxPct}%)`
                }}
              />
              <input
                type="range"
                className="price-range price-range-min"
                min={0}
                max={maxVal}
                step={100}
                value={sliderMin}
                onChange={(e) => onSliderMinChange(Number(e.target.value))}
              />
              <input
                type="range"
                className="price-range price-range-max"
                min={0}
                max={maxVal}
                step={100}
                value={sliderMax}
                onChange={(e) => onSliderMaxChange(Number(e.target.value))}
              />
            </div>
          </div>
        ) : null}

        {loading ? <p style={{ marginTop: 24 }}>Загрузка...</p> : null}

        {!loading && error ? (
          <div className="state-banner">
            <h2 className="miama state-banner-title">Ой!</h2>
            <p className="state-banner-text">Нет интернета</p>
            <button
              type="button"
              className="primary-button state-banner-action"
              onClick={() => void load()}
            >
              перезагрузить
            </button>
          </div>
        ) : null}

        {!loading && !error && state.gifts.length === 0 ? (
          <div className="state-banner">
            <h2 className="miama state-banner-title">Упс!</h2>
            <p className="state-banner-text">
              {searchQuery || selectedCategory > 0 || urgentOnly || isPriceFiltered
                ? "Результатов не найдено,\nпоищите что-то другое"
                : "Подарков пока нет"}
            </p>
          </div>
        ) : null}

        {!loading && !error && state.gifts.length > 0 ? (
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
        ) : null}
      </div>
    </main>
  );
}
