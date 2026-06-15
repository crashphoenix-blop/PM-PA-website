"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminGiftsNav } from "@/features/admin/admin-gifts-nav";
import { useAuth } from "@/features/auth/auth-context";
import { candidateToGift } from "@/features/admin/candidate-to-gift";
import { apiClient, resolveApiAssetUrl } from "@/shared/api/client";
import type { Category, GiftCandidate } from "@/shared/api/types";

function previewImageSrc(candidate: GiftCandidate): string {
  const gift = candidateToGift(candidate);
  if (!gift.image_url) return "/assets/star.svg";
  const resolved = resolveApiAssetUrl(gift.image_url);
  if (gift.image_url.startsWith("/media/")) return resolved;
  if (resolved.startsWith("http://") || resolved.startsWith("https://")) {
    return `/api/image-proxy?url=${encodeURIComponent(resolved)}&title=${encodeURIComponent(gift.name)}`;
  }
  return resolved;
}

export function AdminCandidateDetailScreen({ candidateId }: { candidateId: number }) {
  const router = useRouter();
  const { user, isGuest } = useAuth();
  const isAdmin = Boolean(user?.is_admin) && !isGuest;

  const [candidate, setCandidate] = useState<GiftCandidate | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const [loadedCandidate, loadedCategories] = await Promise.all([
          apiClient.getIngestionCandidate(candidateId),
          apiClient.getCategories()
        ]);
        if (!active) return;
        setCandidate(loadedCandidate);
        setEditedName(loadedCandidate.name);
        setEditedDescription(loadedCandidate.description ?? "");
        setCategories(loadedCategories);
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isAdmin, candidateId]);


  if (!isAdmin) {
    return (
      <main className="page">
        <p>Доступ запрещен</p>
      </main>
    );
  }

  if (loading) return <main className="page">Загрузка...</main>;
  if (error || !candidate) return <main className="page">{error ?? "Не найдено"}</main>;

  const canModerate = candidate.status === "pending" || candidate.status === "duplicate";

  const onApprove = async () => {
    setBusy(true);
    setError(null);
    try {
      await apiClient.approveGiftCandidate(candidate.id, {
        category_ids: [...selectedCategoryIds],
        name: editedName.trim() || candidate.name,
        description: editedDescription.trim() || undefined,
      });
      router.push("/admin/gifts/candidates");
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : "Не удалось опубликовать");
    } finally {
      setBusy(false);
    }
  };

  const onReject = async () => {
    setBusy(true);
    setError(null);
    try {
      await apiClient.rejectGiftCandidate(candidate.id);
      router.push("/admin/gifts/candidates");
    } catch (rejectError) {
      setError(rejectError instanceof Error ? rejectError.message : "Не удалось отклонить");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page" style={{ paddingTop: 0 }}>
      <div className="content-width" style={{ paddingBottom: 200 }}>
        <AdminGiftsNav />
        <Link
          href="/admin/gifts/candidates"
          style={{
            border: 0,
            background: "transparent",
            marginTop: 12,
            marginLeft: 16,
            display: "inline-block"
          }}
        >
          <Image src="/assets/back_icon.svg" alt="Назад" width={40} height={40} />
        </Link>

        <div
          style={{
            borderBottomLeftRadius: 42,
            borderBottomRightRadius: 42,
            overflow: "hidden",
            aspectRatio: "1 / 1.15",
            maxHeight: "min(70dvh, 560px)",
            position: "relative"
          }}
        >
          <Image src={previewImageSrc(candidate)} alt={candidate.name} fill className="cover" unoptimized />
        </div>

        <div style={{ padding: "20px 16px 0" }}>
          <p className="screen-subtitle" style={{ marginBottom: 12 }}>
            {candidate.store_name} · превью для модерации
          </p>

          <label style={{ display: "block", marginBottom: 4, fontSize: 12, color: "var(--app-secondary)" }}>
            Название
          </label>
          <input
            className="search-input"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            style={{ width: "100%", marginBottom: 12 }}
          />

          <p className="gift-meta-price" style={{ fontSize: "1.5rem", marginBottom: 12 }}>
            {Math.trunc(candidate.price)}₽
          </p>

          <label style={{ display: "block", marginBottom: 4, fontSize: 12, color: "var(--app-secondary)" }}>
            Описание
          </label>
          <textarea
            className="search-input"
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            rows={4}
            style={{ width: "100%", resize: "vertical", marginBottom: 16, lineHeight: 1.4 }}
          />

          <a
            href={candidate.store_url}
            target="_blank"
            rel="noreferrer"
            className="primary-button"
            style={{ display: "inline-block", lineHeight: "56px", width: "100%", maxWidth: 360, textAlign: "center" }}
          >
            к продавцу
          </a>
        </div>

        {canModerate ? (
          <div style={{ padding: "24px 16px 0" }}>
            {categories.length > 0 ? (
              <div className="admin-candidate-card__categories" style={{ marginBottom: 16 }}>
                {categories.map((category) => (
                  <label key={category.id} className="chip">
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.has(category.id)}
                      onChange={() => {
                        setSelectedCategoryIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(category.id)) next.delete(category.id);
                          else next.add(category.id);
                          return next;
                        });
                      }}
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            ) : null}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 360 }}>
              <button type="button" className="primary-button" disabled={busy} onClick={onApprove}>
                утвердить — показать в каталоге
              </button>
              <button type="button" className="secondary-button" disabled={busy} onClick={onReject}>
                отклонить
              </button>
            </div>
          </div>
        ) : null}

        {error ? <p className="auth-error" style={{ padding: 16 }}>{error}</p> : null}
      </div>
    </main>
  );
}
