"use client";

import Image from "next/image";
import type { Gift } from "@/shared/api/types";

type GiftCardProps = {
  gift: Gift;
  onOpen: () => void;
  onToggleFavorite: () => void;
};

export function GiftCard({ gift, onOpen, onToggleFavorite }: GiftCardProps) {
  return (
    <article className="gift-card">
      <button
        type="button"
        style={{ all: "unset", display: "block", width: "100%", height: "100%", cursor: "pointer" }}
        onClick={onOpen}
      >
        <Image
          src={gift.image_url || "/assets/star.svg"}
          alt={gift.name}
          width={500}
          height={600}
          className="cover"
          unoptimized
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
          style={{ filter: gift.is_favorite ? "hue-rotate(250deg) saturate(180%)" : "none" }}
        />
      </button>
      <div className="gift-meta">
        <p className="gift-meta-price">{Math.trunc(gift.price)}₽</p>
        <p className="gift-meta-title">{gift.name}</p>
      </div>
    </article>
  );
}
