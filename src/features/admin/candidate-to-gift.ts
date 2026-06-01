import type { Gift, GiftCandidate } from "@/shared/api/types";

/** Превью кандидата в том же формате, что карточки в ленте. */
export function candidateToGift(candidate: GiftCandidate): Gift {
  return {
    id: -candidate.id,
    name: candidate.name,
    description: candidate.description,
    price: candidate.price,
    image_url: candidate.image_url,
    store_name: candidate.store_name,
    store_url: candidate.store_url,
    created_at: candidate.created_at,
    categories: [],
    images: [
      {
        url: candidate.image_url,
        sort_order: 0,
        is_primary: true
      }
    ],
    is_favorite: false
  };
}
