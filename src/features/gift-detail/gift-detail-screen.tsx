"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, resolveApiAssetUrl } from "@/shared/api/client";
import type { Gift } from "@/shared/api/types";
import { toggleFavorite } from "@/features/favorites/favorites-service";
import { trackEvent } from "@/shared/analytics/tracker";

export function GiftDetailScreen({ giftId }: { giftId: number }) {
  const router = useRouter();
  const fallbackSrc = "/assets/star.svg";
  const [gift, setGift] = useState<Gift | null>(null);
  const [imageSrc, setImageSrc] = useState(fallbackSrc);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const details = await apiClient.getGiftDetails(giftId);
        if (active) {
          setGift(details);
          if (!details.image_url) {
            setImageSrc(fallbackSrc);
          } else if (details.image_url.startsWith("/media/")) {
            setImageSrc(resolveApiAssetUrl(details.image_url));
          } else if (details.image_url.startsWith("http://") || details.image_url.startsWith("https://")) {
            setImageSrc(
              `/api/image-proxy?url=${encodeURIComponent(resolveApiAssetUrl(details.image_url))}&title=${encodeURIComponent(details.name)}`
            );
          } else {
            setImageSrc(resolveApiAssetUrl(details.image_url));
          }
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить подарок");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [giftId]);

  const description = gift?.description ?? "";
  const collapsedDescription = useMemo(() => {
    if (description.length < 90) return description;
    return `${description.slice(0, 90)}... еще`;
  }, [description]);

  const onToggleFavorite = async () => {
    if (!gift) return;
    try {
      const isFavorite = await toggleFavorite(gift.id, { surface: "gift_detail" });
      setGift({ ...gift, is_favorite: isFavorite });
    } catch {
      setError("Не удалось обновить избранное");
    }
  };

  if (loading) return <main className="page">Загрузка...</main>;
  if (error || !gift) return <main className="page">{error ?? "Подарок не найден"}</main>;

  return (
    <main className="page" style={{ paddingTop: 0 }}>
      <div className="content-width" style={{ paddingBottom: 160 }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            border: 0,
            background: "transparent",
            marginTop: 12,
            marginLeft: 16,
            cursor: "pointer"
          }}
        >
          <Image src="/assets/back_icon.svg" alt="Назад" width={40} height={40} />
        </button>

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
          <Image
            src={imageSrc}
            alt={gift.name}
            fill
            className="cover"
            unoptimized
            onError={() => {
              if (imageSrc !== fallbackSrc) setImageSrc(fallbackSrc);
            }}
          />
        </div>

        <section style={{ padding: "20px 20px 0" }}>
          <h1 className="screen-subtitle" style={{ margin: 0 }}>
            {gift.name}
          </h1>
          <h2 style={{ marginTop: 8, marginBottom: 0, fontSize: 15, fontWeight: 700 }}>Описание</h2>
          <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.35 }} onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? `${description}  Свернуть` : collapsedDescription}
          </p>
          <p className="page-title" style={{ marginTop: 12 }}>
            {Math.trunc(gift.price)}₽
          </p>
        </section>

        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: "calc(20px + 60px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            zIndex: 30,
            paddingInline: 20
          }}
        >
          <button
            type="button"
            className="primary-button"
            style={{ flex: 1, maxWidth: 280 }}
            onClick={() => setConfirmOpen(true)}
          >
            к продавцу
          </button>
          <button
            type="button"
            onClick={() => void onToggleFavorite()}
            aria-label={gift.is_favorite ? "Удалить из избранного" : "Добавить в избранное"}
            style={{
              border: 0,
              background: gift.is_favorite ? "var(--app-primary)" : "var(--app-surface-soft)",
              borderRadius: "50%",
              width: 55,
              height: 55,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.15s"
            }}
          >
            <Image
              src="/assets/heart.svg"
              alt=""
              width={26}
              height={26}
              style={{
                filter: gift.is_favorite
                  ? "brightness(0) invert(1)"
                  : "opacity(0.7)"
              }}
            />
          </button>
        </div>
      </div>

      {confirmOpen ? (
        <div
          className="confirm-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          onClick={() => setConfirmOpen(false)}
        >
          <div className="confirm-card" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="confirm-close"
              aria-label="Закрыть"
              onClick={() => setConfirmOpen(false)}
            >
              ×
            </button>
            <h2 id="confirm-title" className="miama confirm-title">
              Внимание!
            </h2>
            <p className="confirm-text">
              Покупка происходит в магазине бренда. Если вы согласны перейти на сторонний сайт, нажмите «перейти»
            </p>
            <button
              type="button"
              className="confirm-cta"
              onClick={() => {
                void trackEvent("purchase_click", { gift_id: gift.id, surface: "gift_detail" });
                if (gift.store_url) window.open(gift.store_url, "_blank", "noopener,noreferrer");
                setConfirmOpen(false);
              }}
            >
              перейти
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
