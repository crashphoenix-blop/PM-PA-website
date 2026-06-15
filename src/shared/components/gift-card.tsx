"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Gift } from "@/shared/api/types";
import { resolveApiAssetUrl } from "@/shared/api/client";

type GiftCardProps = {
  gift: Gift;
  onOpen: () => void;
  onToggleFavorite: () => void;
};

export function GiftCard({ gift, onOpen, onToggleFavorite }: GiftCardProps) {
  const fallbackSrc = "/assets/star.svg";
  const [imageSrc, setImageSrc] = useState(gift.image_url || fallbackSrc);

  useEffect(() => {
    if (!gift.image_url) {
      setImageSrc(fallbackSrc);
      return;
    }
    const resolved = resolveApiAssetUrl(gift.image_url);
    if (gift.image_url.startsWith("/media/")) {
      setImageSrc(resolved);
      return;
    }
    if (resolved.startsWith("http://") || resolved.startsWith("https://")) {
      setImageSrc(`/api/image-proxy?url=${encodeURIComponent(resolved)}&title=${encodeURIComponent(gift.name)}`);
      return;
    }
    setImageSrc(resolved);
  }, [gift.image_url, gift.name]);

  return (
    <article className="gift-card">
      <button
        type="button"
        style={{ all: "unset", display: "block", width: "100%", height: "100%", cursor: "pointer" }}
        onClick={onOpen}
      >
        <Image
          src={imageSrc}
          alt={gift.name}
          width={500}
          height={600}
          className="cover"
          unoptimized
          onError={() => {
            if (imageSrc !== fallbackSrc) setImageSrc(fallbackSrc);
          }}
        />
      </button>

      <button
        type="button"
        aria-label="Избранное"
        className="fav-icon-button"
        onClick={(event) => {
          event.stopPropagation();
          onToggleFavorite();
        }}
      >
        <Image
          src="/assets/heart.svg"
          alt=""
          width={32}
          height={32}
          style={{
            filter: gift.is_favorite
              ? "invert(17%) sepia(96%) saturate(6586%) hue-rotate(356deg) brightness(97%) contrast(121%)"
              : "grayscale(0.08) opacity(0.85)"
          }}
        />
      </button>
      <button
        type="button"
        style={{ all: "unset", display: "block", width: "100%", cursor: "pointer" }}
        onClick={onOpen}
      >
        <div className="gift-meta">
          <p className="gift-meta-price">{Math.trunc(gift.price)}₽</p>
          <p className="gift-meta-title">{gift.name}</p>
        </div>
      </button>
    </article>
  );
}
