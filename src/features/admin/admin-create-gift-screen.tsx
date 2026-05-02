"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { apiClient } from "@/shared/api/client";
import type { Category } from "@/shared/api/types";

export function AdminCreateGiftScreen() {
  const router = useRouter();
  const { user, isGuest } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [newGroups, setNewGroups] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAdmin = Boolean(user?.is_admin) && !isGuest;

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    (async () => {
      try {
        const loaded = await apiClient.getCategories();
        if (!active) return;
        setCategories(loaded);
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить категории");
      }
    })();
    return () => {
      active = false;
    };
  }, [isAdmin]);

  const normalizedNewGroups = useMemo(
    () =>
      newGroups
        .split(",")
        .map((chunk) => chunk.trim())
        .filter(Boolean),
    [newGroups]
  );

  if (!isAdmin) {
    return (
      <main className="page">
        <div className="content-width" style={{ maxWidth: 720 }}>
          <h1 className="miama" style={{ color: "var(--app-primary)", fontSize: 36 }}>
            Доступ запрещен
          </h1>
          <p>Эта страница доступна только администратору.</p>
          <Link href="/profile" className="primary-button" style={{ width: 260, lineHeight: "56px", marginTop: 12 }}>
            Вернуться в профиль
          </Link>
        </div>
      </main>
    );
  }

  const onToggleCategory = (categoryId: number) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const onSubmit = async () => {
    if (!name.trim()) {
      setError("Введите название подарка");
      return;
    }
    if (!price.trim() || Number.isNaN(Number(price)) || Number(price) < 0) {
      setError("Введите корректную стоимость");
      return;
    }
    if (!imageUrl.trim()) {
      setError("Добавьте ссылку на изображение");
      return;
    }
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      await apiClient.createGift({
        name: name.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        image_url: imageUrl.trim(),
        store_name: storeName.trim() || undefined,
        store_url: storeUrl.trim() || undefined,
        category_ids: [...selectedCategoryIds],
        category_names: normalizedNewGroups
      });
      setSuccess("Подарок добавлен");
      setName("");
      setDescription("");
      setPrice("");
      setImageUrl("");
      setStoreName("");
      setStoreUrl("");
      setNewGroups("");
      setSelectedCategoryIds(new Set());
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не удалось добавить подарок");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page">
      <div className="content-width" style={{ maxWidth: 720, paddingBottom: 140 }}>
        <h1 className="miama" style={{ color: "var(--app-primary)", fontSize: 36 }}>
          Добавить подарок
        </h1>
        <p style={{ marginBottom: 20 }}>Заполни карточку: товар, цена, описание, ссылка и группы получателей.</p>

        <label className="field-label">Название</label>
        <input className="field-input" value={name} onChange={(event) => setName(event.target.value)} />

        <label className="field-label" style={{ marginTop: 14 }}>
          Описание
        </label>
        <textarea
          className="field-input"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <label className="field-label" style={{ marginTop: 14 }}>
          Стоимость
        </label>
        <input
          className="field-input"
          type="number"
          min={0}
          value={price}
          onChange={(event) => setPrice(event.target.value)}
        />

        <label className="field-label" style={{ marginTop: 14 }}>
          Ссылка на фото
        </label>
        <input className="field-input" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />

        <label className="field-label" style={{ marginTop: 14 }}>
          Магазин
        </label>
        <input className="field-input" value={storeName} onChange={(event) => setStoreName(event.target.value)} />

        <label className="field-label" style={{ marginTop: 14 }}>
          Ссылка на продавца
        </label>
        <input className="field-input" value={storeUrl} onChange={(event) => setStoreUrl(event.target.value)} />

        <label className="field-label" style={{ marginTop: 14 }}>
          Группы получателей (новые, через запятую)
        </label>
        <input
          className="field-input"
          placeholder="для него, для нее, детям"
          value={newGroups}
          onChange={(event) => setNewGroups(event.target.value)}
        />

        <label className="field-label" style={{ marginTop: 14 }}>
          Выбери существующие группы
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {categories.map((category) => (
            <button
              key={category.id}
              className="secondary-button"
              style={{
                background: selectedCategoryIds.has(category.id) ? "var(--app-secondary)" : "transparent",
                color: selectedCategoryIds.has(category.id) ? "#fff" : "var(--app-primary)"
              }}
              onClick={() => onToggleCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {error ? <p style={{ color: "crimson", marginTop: 14 }}>{error}</p> : null}
        {success ? <p style={{ color: "green", marginTop: 14 }}>{success}</p> : null}

        <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
          <button className="primary-button" onClick={() => void onSubmit()} disabled={saving}>
            {saving ? "Сохраняю..." : "Добавить подарок"}
          </button>
          <Link href="/profile" className="secondary-button" style={{ lineHeight: "56px" }}>
            Назад
          </Link>
        </div>
      </div>
    </main>
  );
}
