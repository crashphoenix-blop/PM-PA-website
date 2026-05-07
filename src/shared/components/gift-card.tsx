"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Gift } from "@/shared/api/types";

type GiftCardProps = {
  gift: Gift;
  onOpen: () => void;
  onToggleFavorite: () => void;
};

export function GiftCard({ gift, onOpen, onToggleFavorite }: GiftCardProps) {
  const fallbackSrc = "/assets/star.svg";
  const [imageSrc, setImageSrc] = useState(gift.image_url || fallbackSrc);

  useEffect(() => {
    setImageSrc(gift.image_url || fallbackSrc);
  }, [gift.image_url]);

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
          referrerPolicy="no-referrer"
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
              ? "hue-rotate(265deg) saturate(650%) brightness(1.18) contrast(1.15) drop-shadow(0 0 3px rgba(255,150,255,0.9))"
              : "grayscale(0.08) opacity(0.85)"
          }}
        />
      </button>
      <div className="gift-meta">
        <p className="gift-meta-price">{Math.trunc(gift.price)}₽</p>
        <p className="gift-meta-title">{gift.name}</p>
      </div>
    </article>
  );
}
